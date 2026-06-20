"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";

import {
  handleSubmit as dispatchSubmit,
  serverActionStrategy,
  SUBMISSION_ERROR_MESSAGE,
  type SubmissionStrategy,
  type SubmitResult,
} from "@/lib/forms";
import {
  betaApplicationSchema,
  type BetaApplicationValues,
} from "@/lib/schemas";
import { submitBeta } from "@/app/actions/submit-beta";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * Maximum time, in milliseconds, to wait for a submission before surfacing a
 * non-destructive timeout error and re-enabling the form (Requirement 4.10).
 */
const SUBMIT_TIMEOUT_MS = 30_000;

/** Inline message shown when a submission exceeds {@link SUBMIT_TIMEOUT_MS}. */
const TIMEOUT_MESSAGE =
  "This is taking longer than expected. Please check your connection and try again.";

/** Confirmation message shown after a successful submission (Requirement 4.9). */
const SUCCESS_MESSAGE =
  "Thanks for applying — we've received your application and will be in touch soon.";

export interface BetaApplicationFormProps {
  /**
   * Submission transport. Defaults to the primary Server Action path
   * (`serverActionStrategy(submitBeta)`); overridable for testing
   * (Requirement 5.2).
   */
  strategy?: SubmissionStrategy<BetaApplicationValues>;
  className?: string;
  /**
   * Which intake this form instance serves. Tags the stored submission so beta,
   * careers, and collaboration requests are distinguishable in the sheet.
   * Not user-editable. Defaults to "beta".
   */
  source?: BetaApplicationValues["source"];
  /** Submit button label (idle). Defaults to "Submit application". */
  submitLabel?: string;
  /** Submit button label while a request is in flight. Defaults to "Submitting…". */
  pendingLabel?: string;
  /** Heading shown in the success confirmation. Defaults to "Application received". */
  successTitle?: string;
  /** Body copy shown in the success confirmation. */
  successMessage?: string;
}

/**
 * Race a submission promise against a {@link SUBMIT_TIMEOUT_MS} timer. If the
 * timer wins, resolve to a non-secret timeout error so the caller can keep the
 * user's input and offer a retry (Requirement 4.10). The timer is always
 * cleared to avoid leaks.
 */
async function submitWithTimeout(
  run: () => Promise<SubmitResult>,
): Promise<SubmitResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<SubmitResult>((resolve) => {
    timer = setTimeout(
      () => resolve({ status: "error", message: TIMEOUT_MESSAGE }),
      SUBMIT_TIMEOUT_MS,
    );
  });

  try {
    return await Promise.race([run(), timeout]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

/**
 * Beta / careers application form (client component) built on shadcn `Form` +
 * react-hook-form with shared Zod validation.
 *
 * Behavior (see design.md "Component: Forms" and Requirement 4):
 * - Validates with `betaApplicationSchema` on the client BEFORE any network
 *   request; invalid fields show inline `FormMessage` errors and NO request is
 *   dispatched, while entered values are preserved (Requirements 4.3, 4.4).
 * - On valid submit, dispatches EXACTLY ONE attempt via `handleSubmit` +
 *   `serverActionStrategy(submitBeta)` (Requirements 4.5, 5.2).
 * - Disables the submit control and shows a spinner while pending, re-enabling
 *   on completion (Requirements 4.6, 5.4, 5.6).
 * - Enforces a 30s timeout that yields a non-destructive inline error while
 *   preserving entered values (Requirement 4.10).
 * - Requires an explicit consent checkbox (`consent === true`) before the
 *   submission validates (Requirement 4.1).
 * - Carries a hidden, off-screen `company` honeypot (Requirement 6.1).
 * - Shows a success confirmation on success (Requirement 4.9) and a retryable
 *   inline error preserving values on failure/timeout (Requirement 4.10).
 */
export function BetaApplicationForm({
  strategy,
  className,
  source = "beta",
  submitLabel = "Submit application",
  pendingLabel = "Submitting…",
  successTitle = "Application received",
  successMessage = SUCCESS_MESSAGE,
}: BetaApplicationFormProps) {
  const [result, setResult] = React.useState<SubmitResult | null>(null);

  const submissionStrategy = React.useMemo(
    () => strategy ?? serverActionStrategy(submitBeta),
    [strategy],
  );

  const form = useForm<BetaApplicationValues>({
    resolver: zodResolver(betaApplicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      organization: "",
      role: "",
      message: "",
      // The consent box starts unchecked; the schema requires it to be `true`
      // before a submission validates (Requirement 4.1). RHF's DefaultValues
      // type narrows this literal field, so we assert the initial `false`.
      consent: false as unknown as true,
      company: "",
      source,
    },
    mode: "onSubmit",
  });

  const isPending = form.formState.isSubmitting;

  // Validated submit handler. react-hook-form only invokes this after the
  // client-side Zod validation passes, so no request is dispatched for invalid
  // input (Requirements 4.3, 4.4). Exactly one attempt is made per submit
  // (Requirements 4.5, 5.2).
  const onValid = React.useCallback(
    async (values: BetaApplicationValues) => {
      setResult(null);

      const outcome = await submitWithTimeout(() =>
        dispatchSubmit(values, submissionStrategy, {
          validate: betaApplicationSchema,
        }),
      );

      if (outcome.status === "success") {
        setResult({ status: "success" });
        form.reset();
      } else {
        // Preserve the entered values and offer a retry (Requirement 4.10).
        setResult({
          status: "error",
          message: outcome.message || SUBMISSION_ERROR_MESSAGE,
        });
      }
    },
    [form, submissionStrategy],
  );

  if (result?.status === "success") {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border border-border bg-surface p-6 text-foreground",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="mt-0.5 size-5 text-primary" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-medium">{successTitle}</p>
          <p className="text-sm text-muted-foreground">{successMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onValid)}
        className={cn("space-y-6", className)}
        noValidate
      >
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your full name"
                  autoComplete="name"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your company or institution"
                  autoComplete="organization"
                  disabled={isPending}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your role or title"
                  autoComplete="organization-title"
                  disabled={isPending}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little about why you're interested."
                  disabled={isPending}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value === true}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  disabled={isPending}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I consent to BioAnalytiX storing and processing my information.
                </FormLabel>
                <FormDescription>
                  We use these details only to respond to your application.
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/*
          Honeypot: hidden from sighted and assistive users alike. Real users
          never fill it; a non-empty value is treated as spam server-side
          (Requirement 6.1). Pre-populated empty via defaultValues above.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden"
        >
          <label htmlFor="beta-company">Company</label>
          <input
            id="beta-company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("company")}
          />
          {/* Hidden source tag — identifies which intake this submission came from */}
          <input type="hidden" {...form.register("source")} />
        </div>

        {result?.status === "error" ? (
          <p
            className="text-sm font-medium text-destructive"
            role="alert"
            aria-live="assertive"
          >
            {result.message}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending} aria-busy={isPending}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              {pendingLabel}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </form>
    </Form>
  );
}

export default BetaApplicationForm;
