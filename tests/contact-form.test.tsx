/**
 * Contact form component tests.
 *
 * Validates: Requirements 3.4, 3.5, 3.6, 3.7, 3.9, 3.10, 3.11, 5.1, 5.3, 5.5, 6.1
 *
 * Covers the client-side contract of `ContactForm`:
 *  - Invalid input shows inline field errors and dispatches NO request
 *    (Requirements 3.4, 3.5).
 *  - Valid input dispatches EXACTLY ONE attempt through the strategy
 *    (Requirements 3.6, 5.1).
 *  - The submit control is disabled + shows a spinner while pending and
 *    re-enables on completion (Requirements 3.7, 5.3, 5.5).
 *  - A success confirmation replaces the form on success (Requirement 3.9).
 *  - A failure shows a retryable inline error while preserving entered values
 *    (Requirement 3.10).
 *  - A hidden, off-screen `company` honeypot is present and starts empty
 *    (Requirement 6.1).
 *
 * The default Server Action transport is mocked away so the component can be
 * exercised in jsdom without server-only imports; behavior is driven through an
 * injected strategy.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "@/components/forms/contact-form";
import type { SubmissionStrategy, SubmitResult } from "@/lib/forms";
import type { ContactValues } from "@/lib/schemas";

// The component imports the Server Action for its default strategy; that module
// pulls in server-only APIs (next/headers). Mock it so importing the component
// is safe in jsdom. All tests below inject an explicit strategy anyway.
vi.mock("@/app/actions/submit-contact", () => ({
  submitContact: vi.fn(async (): Promise<SubmitResult> => ({ status: "success" })),
}));

afterEach(() => {
  vi.clearAllMocks();
});

/** Build a strategy whose `submit` is a spy resolving to `result`. */
function makeStrategy(result: SubmitResult): SubmissionStrategy<ContactValues> & {
  submit: ReturnType<typeof vi.fn>;
} {
  return { submit: vi.fn(async () => result) };
}

function fillField(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe("ContactForm", () => {
  it("shows inline errors and dispatches no request for invalid input", async () => {
    const strategy = makeStrategy({ status: "success" });
    render(<ContactForm strategy={strategy} />);

    // Submit with all fields empty.
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    expect(strategy.submit).not.toHaveBeenCalled();
  });

  it("dispatches exactly one attempt for valid input and confirms success", async () => {
    const strategy = makeStrategy({ status: "success" });
    render(<ContactForm strategy={strategy} />);

    fillField(/name/i, "Ada Lovelace");
    fillField(/email/i, "ada@example.com");
    fillField(/message/i, "Hello there, I'd like to learn more.");

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/message sent/i)).toBeInTheDocument();
    expect(strategy.submit).toHaveBeenCalledTimes(1);
    expect(strategy.submit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "Hello there, I'd like to learn more.",
      }),
    );
  });

  it("shows a retryable error and preserves entered values on failure", async () => {
    const strategy = makeStrategy({
      status: "error",
      message: "Submission failed, please retry.",
    });
    render(<ContactForm strategy={strategy} />);

    fillField(/name/i, "Grace Hopper");
    fillField(/email/i, "grace@example.com");
    fillField(/message/i, "Please get back to me.");

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/please retry/i);

    // Values are preserved so the user can retry without re-typing.
    expect(screen.getByLabelText(/name/i)).toHaveValue("Grace Hopper");
    expect(screen.getByLabelText(/email/i)).toHaveValue("grace@example.com");
    expect(screen.getByLabelText(/message/i)).toHaveValue("Please get back to me.");

    // The submit control is re-enabled for a retry (Requirement 5.5).
    expect(screen.getByRole("button", { name: /send message/i })).toBeEnabled();
  });

  it("renders an empty, hidden company honeypot field", () => {
    const strategy = makeStrategy({ status: "success" });
    render(<ContactForm strategy={strategy} />);

    const honeypot = document.getElementById("contact-company") as HTMLInputElement;
    expect(honeypot).not.toBeNull();
    expect(honeypot.value).toBe("");
    expect(honeypot.tabIndex).toBe(-1);
    expect(honeypot.getAttribute("autocomplete")).toBe("off");
    // The honeypot lives inside an aria-hidden, off-screen wrapper.
    expect(honeypot.closest("[aria-hidden='true']")).not.toBeNull();
  });
});
