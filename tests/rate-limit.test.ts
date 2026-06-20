/**
 * Unit tests for the in-memory rolling-window rate limiter (`lib/rate-limit.ts`).
 *
 * Validates: Requirements 6.4, 6.6
 *
 * Coverage:
 *  - Rolling window: allows up to `max` submissions per window then denies, and
 *    re-allows once earlier submissions age out of the trailing window
 *    (Req 6.4 — throttle past the configured maximum).
 *  - No leakage: the result object exposes ONLY `{ allowed }` and never the
 *    configured limit or the remaining quota (Req 6.4).
 *  - Config bounds/defaults: out-of-bounds OR non-finite `windowSeconds` /
 *    `maxSubmissions` fall back to the documented defaults (60s / 5), while
 *    in-bounds values are honored (Req 6.6).
 *
 * All timing is driven through the injectable `now()` clock so the windows are
 * fully deterministic and tests never depend on the wall clock.
 */

import { describe, it, expect } from "vitest";

import {
  createRateLimiter,
  DEFAULT_WINDOW_SECONDS,
  DEFAULT_MAX_SUBMISSIONS,
  MIN_WINDOW_SECONDS,
  MAX_WINDOW_SECONDS,
  MIN_MAX_SUBMISSIONS,
  MAX_MAX_SUBMISSIONS,
} from "@/lib/rate-limit";

/**
 * A controllable clock. `t` is the current time in milliseconds; `advance`
 * moves it forward. Pass `clock.now` as the limiter's `now` source.
 */
function makeClock(start = 0) {
  let t = start;
  return {
    now: () => t,
    advance: (ms: number) => {
      t += ms;
    },
    set: (ms: number) => {
      t = ms;
    },
  };
}

describe("createRateLimiter — rolling window (Requirement 6.4)", () => {
  it("allows up to the maximum within the window then denies further attempts", () => {
    const clock = makeClock(1_000);
    const limiter = createRateLimiter({
      windowSeconds: 10,
      maxSubmissions: 3,
      now: clock.now,
    });

    // First three (== max) are allowed at the same instant.
    expect(limiter.check("client").allowed).toBe(true);
    expect(limiter.check("client").allowed).toBe(true);
    expect(limiter.check("client").allowed).toBe(true);

    // Fourth within the same window is throttled.
    expect(limiter.check("client").allowed).toBe(false);
  });

  it("re-allows once earlier submissions roll out of the trailing window", () => {
    const clock = makeClock(0);
    const limiter = createRateLimiter({
      windowSeconds: 10,
      maxSubmissions: 2,
      now: clock.now,
    });

    expect(limiter.check("client").allowed).toBe(true); // t=0
    expect(limiter.check("client").allowed).toBe(true); // t=0
    expect(limiter.check("client").allowed).toBe(false); // t=0, over max

    // Still strictly inside the 10s window (hits at t=0 not yet aged out).
    clock.set(9_999);
    expect(limiter.check("client").allowed).toBe(false);

    // At/after the window length the t=0 hits age out, so it's allowed again.
    clock.set(10_000);
    expect(limiter.check("client").allowed).toBe(true);
  });

  it("tracks each key independently", () => {
    const clock = makeClock(0);
    const limiter = createRateLimiter({
      windowSeconds: 60,
      maxSubmissions: 1,
      now: clock.now,
    });

    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
    // A different key has its own fresh budget.
    expect(limiter.check("b").allowed).toBe(true);
  });

  it("does not let a throttled client extend its own penalty by retrying", () => {
    const clock = makeClock(0);
    const limiter = createRateLimiter({
      windowSeconds: 10,
      maxSubmissions: 1,
      now: clock.now,
    });

    expect(limiter.check("client").allowed).toBe(true); // t=0, the only hit
    // Hammer while throttled — denied attempts must NOT be recorded.
    clock.set(5_000);
    expect(limiter.check("client").allowed).toBe(false);
    expect(limiter.check("client").allowed).toBe(false);

    // 10s+ after the single recorded hit at t=0, the window clears.
    clock.set(10_001);
    expect(limiter.check("client").allowed).toBe(true);
  });
});

describe("createRateLimiter — result shape exposes no limit details (Requirement 6.4)", () => {
  it("returns only an `allowed` field when permitted", () => {
    const limiter = createRateLimiter({ maxSubmissions: 2 });
    const result = limiter.check("client");

    expect(result).toEqual({ allowed: true });
    expect(Object.keys(result)).toEqual(["allowed"]);
  });

  it("returns only an `allowed` field when denied (no limit/quota/remaining)", () => {
    const limiter = createRateLimiter({ maxSubmissions: 1 });
    limiter.check("client"); // consume the single slot
    const denied = limiter.check("client");

    expect(denied).toEqual({ allowed: false });
    expect(Object.keys(denied)).toEqual(["allowed"]);

    // Defensively assert none of the leak-prone fields are present.
    const leaked = denied as Record<string, unknown>;
    expect(leaked.limit).toBeUndefined();
    expect(leaked.max).toBeUndefined();
    expect(leaked.remaining).toBeUndefined();
    expect(leaked.quota).toBeUndefined();
    expect(leaked.retryAfter).toBeUndefined();
    expect(leaked.resetAt).toBeUndefined();
  });
});

describe("createRateLimiter — config bounds and defaults (Requirement 6.6)", () => {
  // Out-of-bounds OR non-finite windowSeconds must fall back to the 60s default.
  const invalidWindows: Array<[string, number]> = [
    ["zero (below min)", 0],
    ["below min", MIN_WINDOW_SECONDS - 1],
    ["above max", MAX_WINDOW_SECONDS + 1],
    ["negative", -5],
    ["NaN", Number.NaN],
    ["Infinity", Number.POSITIVE_INFINITY],
  ];

  it.each(invalidWindows)(
    "falls back to the %s-second default window for invalid windowSeconds: %s",
    (_label, windowSeconds) => {
      const clock = makeClock(0);
      const limiter = createRateLimiter({
        windowSeconds,
        maxSubmissions: 1,
        now: clock.now,
      });

      expect(limiter.check("client").allowed).toBe(true); // t=0 (the one hit)

      // Just before the default window elapses -> still throttled.
      clock.set((DEFAULT_WINDOW_SECONDS - 1) * 1000);
      expect(limiter.check("client").allowed).toBe(false);

      // Just past the default window -> allowed again.
      clock.set(DEFAULT_WINDOW_SECONDS * 1000 + 1);
      expect(limiter.check("client").allowed).toBe(true);
    },
  );

  // Out-of-bounds OR non-finite maxSubmissions must fall back to the default 5.
  const invalidMaxes: Array<[string, number]> = [
    ["zero (below min)", 0],
    ["below min", MIN_MAX_SUBMISSIONS - 1],
    ["above max", MAX_MAX_SUBMISSIONS + 1],
    ["negative", -3],
    ["NaN", Number.NaN],
    ["Infinity", Number.POSITIVE_INFINITY],
  ];

  it.each(invalidMaxes)(
    "falls back to the default max (5) for invalid maxSubmissions: %s",
    (_label, maxSubmissions) => {
      const clock = makeClock(0);
      const limiter = createRateLimiter({
        windowSeconds: 60,
        maxSubmissions,
        now: clock.now,
      });

      // Exactly DEFAULT_MAX_SUBMISSIONS attempts are allowed, then it denies.
      for (let i = 0; i < DEFAULT_MAX_SUBMISSIONS; i += 1) {
        expect(limiter.check("client").allowed).toBe(true);
      }
      expect(limiter.check("client").allowed).toBe(false);
    },
  );

  it("honors an in-bounds minimum window (1 second), not the default", () => {
    const clock = makeClock(0);
    const limiter = createRateLimiter({
      windowSeconds: MIN_WINDOW_SECONDS, // 1s
      maxSubmissions: 1,
      now: clock.now,
    });

    expect(limiter.check("client").allowed).toBe(true); // t=0
    clock.set(999); // still within the 1s window
    expect(limiter.check("client").allowed).toBe(false);
    clock.set(1_001); // past the 1s window (well before the 60s default)
    expect(limiter.check("client").allowed).toBe(true);
  });

  it("honors an in-bounds maximum window (3600 seconds)", () => {
    const clock = makeClock(0);
    const limiter = createRateLimiter({
      windowSeconds: MAX_WINDOW_SECONDS, // 3600s
      maxSubmissions: 1,
      now: clock.now,
    });

    expect(limiter.check("client").allowed).toBe(true); // t=0
    clock.set((MAX_WINDOW_SECONDS - 1) * 1000); // still inside the hour
    expect(limiter.check("client").allowed).toBe(false);
    clock.set(MAX_WINDOW_SECONDS * 1000 + 1); // past the hour
    expect(limiter.check("client").allowed).toBe(true);
  });

  it("honors an in-bounds maxSubmissions value, not the default", () => {
    const clock = makeClock(0);
    // Use a value distinct from the default (5) to prove it is honored.
    const limiter = createRateLimiter({
      windowSeconds: 60,
      maxSubmissions: 2,
      now: clock.now,
    });

    expect(limiter.check("client").allowed).toBe(true);
    expect(limiter.check("client").allowed).toBe(true);
    expect(limiter.check("client").allowed).toBe(false);
  });

  it("honors the maximum in-bounds maxSubmissions value (1000)", () => {
    const clock = makeClock(0);
    const limiter = createRateLimiter({
      windowSeconds: 60,
      maxSubmissions: MAX_MAX_SUBMISSIONS, // 1000
      now: clock.now,
    });

    for (let i = 0; i < MAX_MAX_SUBMISSIONS; i += 1) {
      expect(limiter.check("client").allowed).toBe(true);
    }
    expect(limiter.check("client").allowed).toBe(false);
  });

  it("uses both defaults when no config is supplied", () => {
    const clock = makeClock(0);
    const limiter = createRateLimiter({ now: clock.now });

    for (let i = 0; i < DEFAULT_MAX_SUBMISSIONS; i += 1) {
      expect(limiter.check("client").allowed).toBe(true);
    }
    expect(limiter.check("client").allowed).toBe(false);
  });
});
