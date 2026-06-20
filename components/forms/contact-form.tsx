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
import { contactSchema, type ContactValues } from "@/lib/schemas";
import { submitContact } from "@/app/actions/submit-contact";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * Maximum time, in milliseconds, to wait for a submission before surfacing a
 * non-destructive timeout error and re-enabling the form (Requirement 3.11).
 */
const SUBMIT_TIMEOUT_MS = 30_000;

/** Inline message shown when a submission exceeds {@link SUBMIT_TIMEOUT_MS}. */
const TIMEOUT_MESSAGE =
  "This is taking longer than expected. Please check your connection and try again.";

/** Confirmation message shown after a successful submission (Requirement 3.9). */
const SUCCESS_MESSAGE =
  "Thanks for reaching out — your message has been sent. We'll be in touch soon.";

export interface ContactFormProps {
  /**
   * Submission transport. Defaults to the primary Server Action path
   * (`serverActionStrategy(submitContact)`); overridable for testing
   * (Requirement 5.1).
   */
  strategy?: SubmissionStrategy<ContactValues>;
  className?: string;
}

/**
 * Race a submission promise against a {@link SUBMIT_TIMEOUT_MS} timer. If the
 * timer wins, resolve to a non-secret timeout error so the caller can keep the
 * user's input and offer a retry (Requirement 3.11). The timer is always
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
 * Contact form (client component) built on shadcn `Form` + react-hook-form with
 * shared Zod validation.
 *
 * Behavior (see design.md "Component: Forms" and "Contact Form Submission"):
 * - Validates with `contactSchema` on the client BEFORE any network request;
 *   invalid fields show inline `FormMessage` errors and NO request is dispatched
 *   (Requirements 3.4, 3.5).
 * - On valid submit, dispatches EXACTLY ONE attempt via `handleSubmit` +
 *   `serverActionStrategy(submitContact)` (Requirements 3.6, 5.1).
 * - Disables the submit control and shows a spinner while pending, re-enabling
 *   on completion (Requirements 3.7, 5.3, 5.5).
 * - Enforces a 30s timeout that yields a non-destructive inline error while
 *   preserving entered values (Requirement 3.11).
 * - Carries a hidden, off-screen `company` honeypot (Requirement 6.1).
 * - Shows a success confirmation on success (Requirement 3.9) and a retryable
 *   inline error preserving values on failure (Requirement 3.10).
 */
export function ContactForm({ strategy, className }: ContactFormProps) {
  const [result, setResult] = React.useState<SubmitResult | null>(null);

  const submissionStrategy = React.useMemo(
    () => strategy ?? serverActionStrategy(submitContact),
    [strategy],
  );

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      company: "",
    },
    mode: "onSubmit",
  });

  const isPending = form.formState.isSubmitting;

  // Validated submit handler. react-hook-form only invokes this after the
  // client-side Zod validation passes, so no request is dispatched for invalid
  // input (Requirements 3.4, 3.5). Exactly one attempt is made per submit
  // (Requirements 3.6, 5.1).
  const onValid = React.useCallback(
    async (values: ContactValues) => {
      setResult(null);

      const outcome = await submitWithTimeout(() =>
        dispatchSubmit(values, submissionStrategy, { validate: contactSchema }),
      );

      if (outcome.status === "success") {
        setResult({ status: "success" });
        form.reset();
      } else {
        // Preserve the entered values and offer a retry (Requirements 3.10, 3.11).
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
          <p className="font-medium">Message sent</p>
          <p className="text-sm text-muted-foreground">{SUCCESS_MESSAGE}</p>
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your name"
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
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="How can we help?"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
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
          <label htmlFor="contact-company">Company</label>
          <input
            id="contact-company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("company")}
          />
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
              Sending…
            </>
          ) : (
            "Send message"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default ContactForm;
