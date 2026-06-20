/**
 * Property-based test — Property 5: Idempotent submit.
 *
 * Validates: Requirements 5.1, 5.2
 *
 * Design (design.md "Property 5: Idempotent submit"):
 *   A single user submit action triggers AT MOST ONE network request.
 *   `∀ submitAction: count(networkRequests) <= 1`.
 *
 * Strategy: render each form with valid inputs and an injected
 * {@link SubmissionStrategy} whose `submit` returns a deferred promise that we
 * hold pending. While that submission is in-flight, the submit button disables
 * (`form.formState.isSubmitting`), so any number of rapid repeated activations
 * within the pending window must collapse to a single `strategy.submit` call.
 *
 * fast-check generates the number of rapid clicks (N ∈ [2, 10]); for every N we
 * assert `strategy.submit` is called at most once while pending. The deferred
 * is resolved during cleanup so no submission is left hanging.
 */
import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import fc from "fast-check";

import { ContactForm } from "@/components/forms/contact-form";
import { BetaApplicationForm } from "@/components/forms/beta-application-form";
import type { SubmissionStrategy, SubmitResult } from "@/lib/forms";
import type { ContactValues, BetaApplicationValues } from "@/lib/schemas";

// Both components import their default Server Action, which pulls in
// server-only APIs (next/headers) that cannot load in jsdom. Mock them away;
// every test injects an explicit strategy regardless.
vi.mock("@/app/actions/submit-contact", () => ({
  submitContact: vi.fn(async (): Promise<SubmitResult> => ({ status: "success" })),
}));
vi.mock("@/app/actions/submit-beta", () => ({
  submitBeta: vi.fn(async (): Promise<SubmitResult> => ({ status: "success" })),
}));

afterEach(() => {
  vi.clearAllMocks();
});

/** A promise plus its resolver, so the test controls when a submit settles. */
interface Deferred {
  promise: Promise<SubmitResult>;
  resolve: (result: SubmitResult) => void;
}

function makeDeferred(): Deferred {
  let resolve!: (result: SubmitResult) => void;
  const promise = new Promise<SubmitResult>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

/**
 * Build a strategy whose `submit` is a spy that stays pending until the shared
 * deferred resolves. Each call returns the same in-flight promise, modelling a
 * slow network request.
 */
function makePendingStrategy<T>(deferred: Deferred): SubmissionStrategy<T> & {
  submit: ReturnType<typeof vi.fn>;
} {
  return { submit: vi.fn(() => deferred.promise) };
}

function fillField(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe("Property 5: Idempotent submit", () => {
  it("contact form: rapid repeated activations dispatch at most one request", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 2, max: 10 }), async (clicks) => {
        const deferred = makeDeferred();
        const strategy = makePendingStrategy<ContactValues>(deferred);

        render(<ContactForm strategy={strategy} />);

        try {
          fillField(/name/i, "Ada Lovelace");
          fillField(/email/i, "ada@example.com");
          fillField(/message/i, "Hello there, I'd like to learn more.");

          const button = screen.getByRole("button", { name: /send message/i });

          // First activation kicks off the (pending) submission.
          fireEvent.click(button);

          // The button disables while the submission is in flight.
          await waitFor(() => expect(button).toBeDisabled());

          // Rapid repeated activations within the pending window.
          for (let i = 1; i < clicks; i += 1) {
            fireEvent.click(button);
          }

          // At most one network request per logical submit (Requirement 5.1).
          expect(strategy.submit.mock.calls.length).toBeLessThanOrEqual(1);
        } finally {
          // Settle the in-flight submission and let the tree finish updating
          // before the next run renders a fresh component.
          deferred.resolve({ status: "success" });
          await waitFor(() =>
            expect(screen.queryByText(/message sent/i)).toBeInTheDocument(),
          );
          cleanup();
        }
      }),
      { numRuns: 25 },
    );
  });

  it("beta application form: rapid repeated activations dispatch at most one request", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 2, max: 10 }), async (clicks) => {
        const deferred = makeDeferred();
        const strategy = makePendingStrategy<BetaApplicationValues>(deferred);

        render(<BetaApplicationForm strategy={strategy} />);

        try {
          fillField(/full name/i, "Ada Lovelace");
          fillField(/email/i, "ada@example.com");
          fireEvent.click(screen.getByRole("checkbox"));

          const button = screen.getByRole("button", {
            name: /submit application/i,
          });

          // First activation kicks off the (pending) submission.
          fireEvent.click(button);

          // The button disables while the submission is in flight.
          await waitFor(() => expect(button).toBeDisabled());

          // Rapid repeated activations within the pending window.
          for (let i = 1; i < clicks; i += 1) {
            fireEvent.click(button);
          }

          // At most one network request per logical submit (Requirement 5.2).
          expect(strategy.submit.mock.calls.length).toBeLessThanOrEqual(1);
        } finally {
          // Settle the in-flight submission and let the tree finish updating
          // before the next run renders a fresh component.
          deferred.resolve({ status: "success" });
          await waitFor(() =>
            expect(
              screen.queryByText(/application received/i),
            ).toBeInTheDocument(),
          );
          cleanup();
        }
      }),
      { numRuns: 25 },
    );
  });
});
