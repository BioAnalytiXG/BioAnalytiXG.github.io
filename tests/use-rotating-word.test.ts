/**
 * Property 7: No timer leaks — hero rotating-word index invariant.
 *
 * Validates: Requirements 11.3, 11.4
 *
 * `useRotatingWord` returns the WORD at the current index, not the index
 * itself. To assert the index invariant we generate `words` arrays whose
 * entries are unique, so each emitted word maps back to exactly one index via
 * `words.indexOf(word)`. We then drive the rotation with Vitest fake timers and
 * assert, for every emitted index:
 *
 *   (11.3) the index invariant `0 <= index < words.length` holds, and
 *   (11.4) advancing from the final index (`words.length - 1`) yields index 0
 *          (the sequence loops back to `words[0]`).
 *
 * `prefers-reduced-motion` is mocked to `matches: false` so the rotation timer
 * actually runs (under reduced motion the hook intentionally starts no timer).
 */
import { act, renderHook } from "@testing-library/react";
import fc from "fast-check";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_ROTATION_INTERVAL_MS, useRotatingWord } from "@/hooks/use-rotating-word";

/**
 * Install a `matchMedia` stub that reports `prefers-reduced-motion: reduce` as
 * NOT matching, so the hook's rotation timer is allowed to start.
 */
function mockMatchMediaReducedMotion(matches: boolean): void {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

describe("Property 7: useRotatingWord index invariant (Req 11.3, 11.4)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMediaReducedMotion(false);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("keeps 0 <= index < words.length for every emitted index and loops to 0 (Req 11.3, 11.4)", () => {
    fc.assert(
      fc.property(
        // Arbitrary non-empty `words` arrays with UNIQUE entries so an emitted
        // word maps unambiguously back to its index.
        fc.uniqueArray(fc.string(), { minLength: 1, maxLength: 8 }),
        (words) => {
          const { result, unmount } = renderHook(() => useRotatingWord(words));

          try {
            // Index invariant on the initial emission: it starts at words[0].
            expect(result.current).toBe(words[0]);

            // Advance enough ticks to wrap past the final index at least once
            // so the loop-back-to-0 behaviour (Req 11.4) is exercised.
            const steps = words.length + 2;
            const emittedIndices: number[] = [0];

            for (let step = 1; step <= steps; step += 1) {
              act(() => {
                vi.advanceTimersByTime(DEFAULT_ROTATION_INTERVAL_MS);
              });

              const index = words.indexOf(result.current);

              // (11.3) Every emitted word resolves to an in-range index.
              expect(index).toBeGreaterThanOrEqual(0);
              expect(index).toBeLessThan(words.length);

              // Sequential, modulo advance — this is the index invariant in
              // motion and encodes (11.4): the step where `step % length === 0`
              // is precisely the wrap from the final index back to 0.
              expect(index).toBe(step % words.length);

              emittedIndices.push(index);
            }

            // Explicit (11.4) check: after exactly `words.length` advances the
            // sequence has returned to index 0 (words[0]).
            expect(emittedIndices[words.length]).toBe(0);
            // And every recorded index stayed within range throughout.
            expect(
              emittedIndices.every((i) => i >= 0 && i < words.length),
            ).toBe(true);
          } finally {
            unmount();
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
