/**
 * Property-based test for form submission validity (design.md "Property 2").
 *
 * Property 2: Form validity
 *   For all form inputs, a submission is sent **iff** the input passes Zod
 *   validation: `∀ v: networkCallMade(v) ⟺ schema.parse(v).success`.
 *
 * Validates: Requirements 3.4, 3.6, 4.3, 4.5
 *
 * Strategy: `handleSubmit(values, strategy, { validate })` validates BEFORE
 * dispatch and calls `strategy.submit` AT MOST ONCE, only when validation
 * succeeds. We generate arbitrary form-like objects for BOTH the contact and
 * beta-application shapes — deliberately mixing valid and invalid field values
 * so both branches are exercised — and for each one assert that the mock
 * strategy's `submit` spy was called EXACTLY when the schema accepts the input
 * and NOT called when it rejects. The schema itself is the oracle (ground
 * truth), so the test proves the handler dispatches a network call iff the
 * shared Zod schema validates.
 */

import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { handleSubmit, type SubmissionStrategy } from "@/lib/forms";
import { betaApplicationSchema, contactSchema } from "@/lib/schemas";

/**
 * Email arbitrary that mixes well-formed addresses (to exercise the "valid"
 * branch) with arbitrary garbage strings (to exercise the "invalid" branch).
 */
const emailArb = fc.oneof(
  fc.emailAddress(),
  fc.constantFrom(
    "user@example.com",
    "a@b.co",
    "first.last@sub.domain.org",
    "",
    "not-an-email",
    "missing-at.example.com",
  ),
  fc.string(),
);

/**
 * Optional string arbitrary: sometimes omitted (undefined), sometimes an
 * arbitrary string (which may be empty, whitespace, or over a length bound).
 */
const optionalStringArb = fc.option(fc.string(), { nil: undefined });

/**
 * Contact form-like objects. `name`/`message` are arbitrary strings (so empty,
 * whitespace, and over-long values all appear), `email` mixes valid/invalid,
 * and the `company` honeypot is sometimes present.
 */
const contactArb = fc.record({
  name: fc.string(),
  email: emailArb,
  message: fc.string(),
  company: optionalStringArb,
});

/**
 * Beta-application form-like objects. `fullName` is an arbitrary string,
 * optional fields are sometimes omitted, and `consent` is sometimes a boolean
 * (true/false) and sometimes omitted — so the strict `literal(true)` rule is
 * exercised on both sides.
 */
const betaArb = fc.record({
  fullName: fc.string(),
  email: emailArb,
  organization: optionalStringArb,
  role: optionalStringArb,
  message: optionalStringArb,
  consent: fc.option(fc.boolean(), { nil: undefined }),
  company: optionalStringArb,
});

/**
 * Build a fresh mock strategy whose `submit` is a spy resolving to success.
 * A success result keeps the focus on whether a dispatch happened at all.
 */
function makeSpyStrategy<T>(): SubmissionStrategy<T> & {
  submit: ReturnType<typeof vi.fn>;
} {
  const submit = vi.fn(async () => ({ status: "success" as const }));
  return { submit };
}

describe("Property 2: Form validity (network call dispatched iff schema validates)", () => {
  it("dispatches a contact submission exactly when contactSchema accepts the input (Req 3.4, 3.6)", async () => {
    await fc.assert(
      fc.asyncProperty(contactArb, async (values) => {
        const expectedValid = contactSchema.safeParse(values).success;
        const strategy = makeSpyStrategy<unknown>();

        await handleSubmit(values, strategy, { validate: contactSchema });

        // iff: submit called exactly once when valid, never when invalid.
        expect(strategy.submit).toHaveBeenCalledTimes(expectedValid ? 1 : 0);
      }),
      { numRuns: 500 },
    );
  });

  it("dispatches a beta submission exactly when betaApplicationSchema accepts the input (Req 4.3, 4.5)", async () => {
    await fc.assert(
      fc.asyncProperty(betaArb, async (values) => {
        const expectedValid = betaApplicationSchema.safeParse(values).success;
        const strategy = makeSpyStrategy<unknown>();

        await handleSubmit(values, strategy, {
          validate: betaApplicationSchema,
        });

        expect(strategy.submit).toHaveBeenCalledTimes(expectedValid ? 1 : 0);
      }),
      { numRuns: 500 },
    );
  });
});
