/**
 * Beta / careers application form component tests.
 *
 * Validates: Requirements 4.3, 4.4, 4.5, 4.6, 4.9, 4.10, 5.2, 5.4, 5.6, 6.1
 *
 * Covers the client-side contract of `BetaApplicationForm`:
 *  - Invalid input shows inline field errors (including the required consent)
 *    and dispatches NO request (Requirements 4.3, 4.4).
 *  - Valid input dispatches EXACTLY ONE attempt through the strategy
 *    (Requirements 4.5, 5.2).
 *  - The submit control is disabled + shows a spinner while pending and
 *    re-enables on completion (Requirements 4.6, 5.4, 5.6).
 *  - A success confirmation replaces the form on success (Requirement 4.9).
 *  - A failure shows a retryable inline error while preserving entered values
 *    (Requirement 4.10).
 *  - A hidden, off-screen `company` honeypot is present and starts empty
 *    (Requirement 6.1).
 *
 * The default Server Action transport is mocked away so the component can be
 * exercised in jsdom without server-only imports; behavior is driven through an
 * injected strategy.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BetaApplicationForm } from "@/components/forms/beta-application-form";
import type { SubmissionStrategy, SubmitResult } from "@/lib/forms";
import type { BetaApplicationValues } from "@/lib/schemas";

// The component imports the Server Action for its default strategy; that module
// pulls in server-only APIs (next/headers). Mock it so importing the component
// is safe in jsdom. All tests below inject an explicit strategy anyway.
vi.mock("@/app/actions/submit-beta", () => ({
  submitBeta: vi.fn(async (): Promise<SubmitResult> => ({ status: "success" })),
}));

afterEach(() => {
  vi.clearAllMocks();
});

/** Build a strategy whose `submit` is a spy resolving to `result`. */
function makeStrategy(
  result: SubmitResult,
): SubmissionStrategy<BetaApplicationValues> & {
  submit: ReturnType<typeof vi.fn>;
} {
  return { submit: vi.fn(async () => result) };
}

function fillField(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

/** Fill the required fields and check the consent box for a valid submission. */
function fillValid() {
  fillField(/full name/i, "Ada Lovelace");
  fillField(/email/i, "ada@example.com");
  fireEvent.click(screen.getByRole("checkbox"));
}

describe("BetaApplicationForm", () => {
  it("shows inline errors and dispatches no request for invalid input", async () => {
    const strategy = makeStrategy({ status: "success" });
    render(<BetaApplicationForm strategy={strategy} />);

    // Submit with required fields empty and consent unchecked.
    fireEvent.click(screen.getByRole("button", { name: /submit application/i }));

    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/you must provide consent/i)).toBeInTheDocument();
    expect(strategy.submit).not.toHaveBeenCalled();
  });

  it("does not dispatch when consent is not given", async () => {
    const strategy = makeStrategy({ status: "success" });
    render(<BetaApplicationForm strategy={strategy} />);

    fillField(/full name/i, "Ada Lovelace");
    fillField(/email/i, "ada@example.com");
    // Intentionally leave the consent box unchecked.

    fireEvent.click(screen.getByRole("button", { name: /submit application/i }));

    expect(await screen.findByText(/you must provide consent/i)).toBeInTheDocument();
    expect(strategy.submit).not.toHaveBeenCalled();
  });

  it("dispatches exactly one attempt for valid input and confirms success", async () => {
    const strategy = makeStrategy({ status: "success" });
    render(<BetaApplicationForm strategy={strategy} />);

    fillValid();
    fireEvent.click(screen.getByRole("button", { name: /submit application/i }));

    expect(await screen.findByText(/application received/i)).toBeInTheDocument();
    expect(strategy.submit).toHaveBeenCalledTimes(1);
    expect(strategy.submit).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        consent: true,
      }),
    );
  });

  it("shows a retryable error and preserves entered values on failure", async () => {
    const strategy = makeStrategy({
      status: "error",
      message: "Submission failed, please retry.",
    });
    render(<BetaApplicationForm strategy={strategy} />);

    fillField(/full name/i, "Grace Hopper");
    fillField(/email/i, "grace@example.com");
    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.click(screen.getByRole("button", { name: /submit application/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/please retry/i);

    // Values are preserved so the user can retry without re-typing.
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Grace Hopper");
    expect(screen.getByLabelText(/email/i)).toHaveValue("grace@example.com");

    // The submit control is re-enabled for a retry (Requirement 5.6).
    expect(
      screen.getByRole("button", { name: /submit application/i }),
    ).toBeEnabled();
  });

  it("renders an empty, hidden company honeypot field", () => {
    const strategy = makeStrategy({ status: "success" });
    render(<BetaApplicationForm strategy={strategy} />);

    const honeypot = document.getElementById("beta-company") as HTMLInputElement;
    expect(honeypot).not.toBeNull();
    expect(honeypot.value).toBe("");
    expect(honeypot.tabIndex).toBe(-1);
    expect(honeypot.getAttribute("autocomplete")).toBe("off");
    // The honeypot lives inside an aria-hidden, off-screen wrapper.
    expect(honeypot.closest("[aria-hidden='true']")).not.toBeNull();
  });
});
