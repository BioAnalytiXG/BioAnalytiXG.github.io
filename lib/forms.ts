/**
 * Form submission strategies and the transport/validation-focused submit
 * handler.
 *
 * This module is intentionally narrow: it owns the pluggable
 * `SubmissionStrategy` abstraction and a `handleSubmit` that validates input
 * BEFORE dispatch and performs AT MOST ONE submission attempt. UI concerns
 * (pending state, the 30s timeout/abort, success/error rendering) live in the
 * form components, not here. See design.md "Components and Interfaces" >
 * "Component: Forms", "Data Models", and the "Form Submission with Pluggable
 * Strategy" pseudocode. (Requirements 3.6, 4.5, 15.4.)
 */

/**
 * The outcome of a submission attempt. A success carries no payload; an error
 * carries a human-readable, non-secret message suitable for inline display.
 */
export type SubmitResult =
  | { status: "success" }
  | { status: "error"; message: string };

/**
 * A pluggable transport for delivering validated form values. The primary
 * implementation wraps a Next.js Server Action (`serverActionStrategy`); the
 * provider-POST transport (`providerStrategy`) is an alternate the action can
 * call server-side.
 */
export interface SubmissionStrategy<T> {
  submit(values: T): Promise<SubmitResult>;
}

/**
 * Something that can validate `values` before dispatch. Either a Zod-style
 * schema exposing `safeParse`, or a plain predicate/validator function.
 *
 * - A schema returns `{ success: true; data }` or `{ success: false }`.
 * - A validate function returns the parsed/normalized value on success, or
 *   `null`/`undefined`/`false` (or throws) to signal invalid input.
 */
export interface SafeParseSchema<T> {
  safeParse(values: unknown): { success: true; data: T } | { success: false };
}

export type ValidateFn<T> = (values: unknown) => T | null | undefined | false;

export type Validator<T> = SafeParseSchema<T> | ValidateFn<T>;

/**
 * Default error message returned when validation fails before dispatch.
 * Field-level errors are surfaced by the form component; this is the generic
 * signal that no network request was made.
 */
export const VALIDATION_ERROR_MESSAGE = "Please correct the highlighted fields and try again.";

/**
 * Default error message returned when a strategy throws or otherwise fails to
 * produce a result. Carries no secrets and invites a retry.
 */
export const SUBMISSION_ERROR_MESSAGE = "Submission failed, please retry.";

/**
 * Wrap a Next.js Server Action as the PRIMARY submission strategy.
 *
 * The provided `action` is a registered `"use server"` function of the shape
 * `(values: T) => Promise<SubmitResult>` that performs authoritative
 * server-side validation, rate limiting, spam checks, and delivery. The
 * returned strategy performs exactly one call to the action per `submit`.
 *
 * @param action - The Server Action to invoke.
 */
export function serverActionStrategy<T>(
  action: (values: T) => Promise<SubmitResult>
): SubmissionStrategy<T> {
  return {
    async submit(values: T): Promise<SubmitResult> {
      return action(values);
    },
  };
}

/**
 * Options for {@link providerStrategy}.
 */
export interface ProviderStrategyOptions {
  /**
   * Provider endpoint URL. Defaults to the `CONTACT_FORM_ENDPOINT` server-only
   * environment variable. The value is read on the server only and is never
   * shipped to the client (Requirement 15.4).
   */
  endpoint?: string;
  /**
   * Additional headers (e.g. an `Authorization` bearer token whose secret comes
   * from a server-only env var). Never pass client-exposed secrets here.
   */
  headers?: Record<string, string>;
  /**
   * Optional `fetch` implementation override (primarily for testing). Defaults
   * to the global `fetch`.
   */
  fetchImpl?: typeof fetch;
}

/**
 * Alternate transport that POSTs validated values to a provider endpoint
 * (e.g. Formspree / Web3Forms) as JSON. It is invoked SERVER-SIDE only, from
 * within a Server Action — secrets (endpoint/keys) come from server-only
 * environment variables and are never embedded in client code (Requirement
 * 15.4).
 *
 * The returned strategy performs exactly one `fetch` per `submit`: a 2xx
 * response resolves to `{ status: "success" }`, any other response or a thrown
 * network error resolves to a non-secret `{ status: "error" }`.
 *
 * @param options - Endpoint, headers, and an optional `fetch` override. A bare
 *   string is accepted as a shorthand for `{ endpoint }`.
 */
export function providerStrategy<T>(
  options: ProviderStrategyOptions | string = {}
): SubmissionStrategy<T> {
  const opts: ProviderStrategyOptions =
    typeof options === "string" ? { endpoint: options } : options;

  return {
    async submit(values: T): Promise<SubmitResult> {
      const endpoint = opts.endpoint ?? process.env.CONTACT_FORM_ENDPOINT;

      if (!endpoint) {
        return {
          status: "error",
          message: SUBMISSION_ERROR_MESSAGE,
        };
      }

      const doFetch = opts.fetchImpl ?? fetch;

      try {
        const response = await doFetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...opts.headers,
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          return { status: "error", message: SUBMISSION_ERROR_MESSAGE };
        }

        return { status: "success" };
      } catch {
        return { status: "error", message: SUBMISSION_ERROR_MESSAGE };
      }
    },
  };
}

/**
 * Normalize either a schema or a validate function into a single result shape.
 * Returns the parsed value on success or `null` on failure (a thrown validate
 * function is treated as failure).
 */
function runValidator<T>(validate: Validator<T>, values: unknown): T | null {
  if (typeof validate === "function") {
    try {
      const result = validate(values);
      if (result === null || result === undefined || result === false) {
        return null;
      }
      return result as T;
    } catch {
      return null;
    }
  }

  const parsed = validate.safeParse(values);
  return parsed.success ? parsed.data : null;
}

/**
 * Options for {@link handleSubmit}.
 */
export interface HandleSubmitOptions<T> {
  /**
   * The validator to run BEFORE dispatch — a Zod-style schema (`safeParse`) or
   * a plain validate function. If validation fails, the strategy is NOT called.
   */
  validate: Validator<T>;
}

/**
 * Validate `values` and, only if valid, perform AT MOST ONE submission attempt
 * through `strategy`.
 *
 * Contract (design.md "Form Submission with Pluggable Strategy"):
 * - If validation fails, returns an error result and dispatches NO request.
 * - If validation succeeds, calls `strategy.submit` exactly once and returns
 *   its result.
 * - If the strategy throws, the error is caught and a generic, non-secret
 *   error result is returned (still a single attempt — no retry here).
 *
 * Timeout/abort (the 30s limit) is deliberately NOT handled here; it belongs to
 * the form components per the design.
 *
 * @param values - The raw form values to validate and submit.
 * @param strategy - The submission transport to dispatch through.
 * @param options - Validation options (the schema or validate function).
 */
export async function handleSubmit<T>(
  values: unknown,
  strategy: SubmissionStrategy<T>,
  options: HandleSubmitOptions<T>
): Promise<SubmitResult> {
  const parsed = runValidator(options.validate, values);

  if (parsed === null) {
    // Validation failed: surface field errors, make no network call.
    return { status: "error", message: VALIDATION_ERROR_MESSAGE };
  }

  try {
    return await strategy.submit(parsed);
  } catch {
    return { status: "error", message: SUBMISSION_ERROR_MESSAGE };
  }
}
