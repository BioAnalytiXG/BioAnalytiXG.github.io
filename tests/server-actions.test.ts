/**
 * Unit tests for the form Server Actions' honeypot and rate-limiting behavior
 * (`app/actions/submit-contact.ts`, `app/actions/submit-beta.ts`).
 *
 * Validates: Requirements 6.2, 6.4
 *
 * Coverage:
 *  - Honeypot (Req 6.2): a non-empty trimmed `company` field causes the action
 *    to silently discard the submission and return a response IDENTICAL to a
 *    normal success, while performing NO delivery (the mocked `fetch` is never
 *    called).
 *  - Rate limiting (Req 6.4): once a single client exceeds the configured
 *    maximum within the rolling window, the action returns an error result that
 *    invites a retry WITHOUT revealing the numeric limit or remaining quota.
 *
 * `next/headers` is mocked so the actions derive a deterministic per-client key
 * from a controllable `x-forwarded-for` value, and the global `fetch` is stubbed
 * so delivery is observable. The actions share the module-singleton
 * `formRateLimiter`, so it is cleared before every test to keep budgets
 * deterministic and isolated.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Hoisted holder for the mocked request headers so the mock factory (which is
// hoisted above imports) can read a value the tests mutate per-case.
const mocked = vi.hoisted(() => ({
  headerMap: new Map<string, string>(),
}));

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string): string | null =>
      mocked.headerMap.get(name.toLowerCase()) ?? null,
  }),
}));

import { submitContact } from "@/app/actions/submit-contact";
import { submitBeta } from "@/app/actions/submit-beta";
import { formRateLimiter } from "@/lib/rate-limit";

/** A success result that delivery is expected to produce. */
const SUCCESS = { status: "success" } as const;

/**
 * Upper bound on submission attempts when probing for throttling. The limiter's
 * maximum configurable `maxSubmissions` is 1000, so this comfortably guarantees
 * we cross the threshold even at the largest valid configuration.
 */
const MAX_ATTEMPTS = 1100;

/** A stubbed `fetch` that always resolves with a 2xx (delivery succeeds). */
const fetchMock = vi.fn(
  async (): Promise<Response> => new Response(null, { status: 200 }),
);

/** Build a valid contact submission with an empty (clean) honeypot. */
function validContact(overrides: Record<string, unknown> = {}) {
  return {
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Hello there, this is a genuine message.",
    company: "",
    ...overrides,
  };
}

/** Build a valid beta submission with an empty (clean) honeypot. */
function validBeta(overrides: Record<string, unknown> = {}) {
  return {
    fullName: "Grace Hopper",
    email: "grace@example.com",
    consent: true as const,
    company: "",
    ...overrides,
  };
}

beforeEach(() => {
  // Reset shared singleton state and per-test inputs.
  formRateLimiter.clear();
  mocked.headerMap = new Map<string, string>();
  fetchMock.mockClear();

  vi.stubGlobal("fetch", fetchMock);

  // Server-only delivery endpoints (read inside the actions/strategy).
  process.env.CONTACT_FORM_ENDPOINT = "https://provider.test/contact";
  process.env.BETA_FORM_ENDPOINT = "https://provider.test/beta";
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.CONTACT_FORM_ENDPOINT;
  delete process.env.BETA_FORM_ENDPOINT;
});

describe("submitContact — honeypot (Requirement 6.2)", () => {
  it("returns a success-identical response and performs NO delivery when the honeypot is filled", async () => {
    mocked.headerMap.set("x-forwarded-for", "198.51.100.10");

    // A genuine submission delivers and yields the canonical success result.
    const genuine = await submitContact(validContact());
    expect(genuine).toEqual(SUCCESS);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // A bot fills the hidden `company` field. Reset delivery observation.
    fetchMock.mockClear();
    const trapped = await submitContact(
      validContact({ company: "Acme Spam Co" }),
    );

    // Identical to a real success — no rejection reason is revealed...
    expect(trapped).toEqual(SUCCESS);
    expect(trapped).toEqual(genuine);
    // ...and crucially, delivery never happened.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats a whitespace-only honeypot as empty (trimmed) and delivers normally", async () => {
    mocked.headerMap.set("x-forwarded-for", "198.51.100.11");

    // The shared honeypot schema trims `company`, so a whitespace-only value is
    // empty after trimming and is NOT spam per Req 6.2 ("trimmed value is
    // non-empty"). Such a submission is delivered like any genuine one.
    const result = await submitContact(validContact({ company: "   " }));

    expect(result).toEqual(SUCCESS);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("submitBeta — honeypot (Requirement 6.2)", () => {
  it("returns a success-identical response and performs NO delivery when the honeypot is filled", async () => {
    mocked.headerMap.set("x-forwarded-for", "198.51.100.20");

    const genuine = await submitBeta(validBeta());
    expect(genuine).toEqual(SUCCESS);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockClear();
    const trapped = await submitBeta(validBeta({ company: "Bot Corp" }));

    expect(trapped).toEqual(SUCCESS);
    expect(trapped).toEqual(genuine);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

/**
 * Assert a throttled-error message reveals neither the configured limit nor the
 * remaining quota: it must carry no digits and none of the leak-prone words.
 */
function expectNoLimitLeakage(message: string): void {
  expect(typeof message).toBe("string");
  expect(message.length).toBeGreaterThan(0);
  expect(message).not.toMatch(/\d/); // no numeric limit/quota/remaining count
  const lower = message.toLowerCase();
  expect(lower).not.toContain("limit");
  expect(lower).not.toContain("quota");
  expect(lower).not.toContain("remaining");
}

describe("submitContact — rate limiting (Requirement 6.4)", () => {
  it("throttles a client past the window and leaks no limit details", async () => {
    mocked.headerMap.set("x-forwarded-for", "203.0.113.7");

    let throttled: { status: string; message?: string } | undefined;
    // Loop well past the maximum possible configured max (1000) so the test is
    // robust regardless of the env-derived window/max configuration.
    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
      const result = await submitContact(validContact());
      if (result.status === "error") {
        throttled = result;
        break;
      }
    }

    expect(throttled).toBeDefined();
    expect(throttled?.status).toBe("error");
    expectNoLimitLeakage(throttled?.message ?? "");
  });

  it("keeps allowing a different client while one is throttled", async () => {
    mocked.headerMap.set("x-forwarded-for", "203.0.113.8");
    // Drive the first client until it is throttled.
    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
      const r = await submitContact(validContact());
      if (r.status === "error") break;
    }

    // A fresh client (distinct IP) still succeeds.
    mocked.headerMap.set("x-forwarded-for", "203.0.113.9");
    const other = await submitContact(validContact());
    expect(other).toEqual(SUCCESS);
  });
});

describe("submitBeta — rate limiting (Requirement 6.4)", () => {
  it("throttles a client past the window and leaks no limit details", async () => {
    mocked.headerMap.set("x-forwarded-for", "203.0.113.77");

    let throttled: { status: string; message?: string } | undefined;
    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
      const result = await submitBeta(validBeta());
      if (result.status === "error") {
        throttled = result;
        break;
      }
    }

    expect(throttled).toBeDefined();
    expect(throttled?.status).toBe("error");
    expectNoLimitLeakage(throttled?.message ?? "");
  });
});
