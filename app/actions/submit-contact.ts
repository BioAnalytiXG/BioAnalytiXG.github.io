"use server";

/**
 * Contact form Server Action (primary submission path).
 *
 * This is the authoritative server-side handler for contact submissions. It is
 * invoked through `serverActionStrategy(submitContact)` from the contact form
 * component. The browser's client-side Zod validation is for UX only and is NOT
 * trusted here — every submission is re-validated, spam-checked, rate-limited,
 * and delivered entirely on the server.
 *
 * Behavior (see design.md "Contact Form Submission" and "Component: Forms"):
 * 1. Re-validate the incoming values with `contactSchema`. On failure, return a
 *    non-success result WITHOUT attempting delivery. (Req 3.8.)
 * 2. Honeypot: if the `company` field is non-empty after trimming, silently
 *    discard the submission (no delivery, no persistence) and return a response
 *    IDENTICAL to a successful submission, revealing no rejection reason.
 *    (Req 6.2.)
 * 3. Rate limit per client (derived from request IP headers). When throttled,
 *    return a generic "try again later" error WITHOUT leaking the limit value or
 *    remaining quota. (Req 6.4.)
 * 4. Read all provider keys/endpoint exclusively from server-only environment
 *    variables, and never include any secret in the response. (Req 6.5, 15.4.)
 * 5. Deliver via the provider transport. On delivery failure, return a
 *    non-success result (preserving no secrets) so the form can retain the
 *    user's input and offer a retry. (Req 15.5.)
 */

import { headers } from "next/headers";

import {
  SUBMISSION_ERROR_MESSAGE,
  VALIDATION_ERROR_MESSAGE,
  type SubmitResult,
} from "@/lib/forms";
import { sendContactEmail } from "@/lib/email";
import { formRateLimiter } from "@/lib/rate-limit";
import { contactSchema, type ContactValues } from "@/lib/schemas";

/**
 * Generic message shown when a client is throttled by the rate limiter. It
 * deliberately reveals neither the configured limit nor the remaining quota
 * (Req 6.4).
 */
const RATE_LIMIT_MESSAGE =
  "Too many submissions. Please wait a moment and try again.";

/** Fallback rate-limit key used when no client identifier can be derived. */
const ANONYMOUS_RATE_LIMIT_KEY = "contact:anonymous";

/**
 * Derive a stable per-client rate-limit key from the incoming request headers.
 *
 * Prefers the first hop of `x-forwarded-for`, then `x-real-ip`. Falls back to a
 * constant key when no client identifier is available (e.g. local/dev), so the
 * limiter still degrades gracefully rather than throwing. The derived value is
 * used only for throttling and is never returned to the client.
 */
async function deriveRateLimitKey(): Promise<string> {
  try {
    const headerList = await headers();

    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) {
      const firstHop = forwardedFor.split(",")[0]?.trim();
      if (firstHop) {
        return `contact:${firstHop}`;
      }
    }

    const realIp = headerList.get("x-real-ip")?.trim();
    if (realIp) {
      return `contact:${realIp}`;
    }
  } catch {
    // headers() can throw outside a request scope; fall through to the default.
  }

  return ANONYMOUS_RATE_LIMIT_KEY;
}

/**
 * Authoritative server-side contact submission handler.
 *
 * Signature is compatible with `serverActionStrategy<ContactValues>`: it accepts
 * the parsed contact values and resolves to a {@link SubmitResult}. Never throws
 * for expected outcomes — validation, spam, throttling, and delivery failures
 * are all reported as structured results.
 *
 * @param values - The submitted contact values (re-validated here; not trusted).
 * @returns `{ status: "success" }` on accepted delivery (or a silently discarded
 *   honeypot hit), otherwise `{ status: "error"; message }` with a non-secret,
 *   user-safe message.
 */
export async function submitContact(
  values: ContactValues
): Promise<SubmitResult> {
  // 1. Re-validate authoritatively. Client validation is not trusted (Req 3.8).
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: VALIDATION_ERROR_MESSAGE };
  }

  const data = parsed.data;

  // 2. Honeypot: a filled `company` field signals a bot. Silently discard with
  //    a success-identical response — no delivery, no persistence, no leaked
  //    rejection reason (Req 6.2).
  if ((data.company ?? "").trim() !== "") {
    return { status: "success" };
  }

  // 3. Rate limit per client. On throttle, return a generic retry message that
  //    leaks neither the limit nor the remaining quota (Req 6.4).
  const rateLimitKey = await deriveRateLimitKey();
  const { allowed } = formRateLimiter.check(rateLimitKey);
  if (!allowed) {
    return { status: "error", message: RATE_LIMIT_MESSAGE };
  }

  // 4. Deliver the submission as an email to the BioAnalytiX inbox via Resend.
  //    The API key and recipient are read exclusively from server-only
  //    environment variables inside `sendContactEmail`; secrets are never
  //    returned to the client (Req 6.5, 15.4). Strip the honeypot field — it
  //    carries no business value.
  const { company: _honeypot, ...payload } = data;
  void _honeypot;

  const delivered = await sendContactEmail(payload);
  if (!delivered) {
    // Unconfigured or delivery failure: report a generic, non-secret error so
    // the form retains the user's input and can retry (Req 15.5).
    return { status: "error", message: SUBMISSION_ERROR_MESSAGE };
  }

  return { status: "success" };
}
