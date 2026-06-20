/**
 * Property 4: Reduced motion.
 *
 * Validates: Requirements 10.3, 10.4
 *
 * When `prefers-reduced-motion: reduce` is set, the motion system renders the
 * static final frame of every animation, starts no timers, and registers no
 * intersection observers. This suite covers the two consumer paths exercised by
 * the home page:
 *
 *  - The Hero rotating word (Req 10.4): under reduced motion the hero displays
 *    the FIRST word statically — no rotation timer is left running and the
 *    displayed word never advances even as fake time passes. We assert this
 *    both at the hook level (`useRotatingWord` via `renderHook`) and at the
 *    component level (rendering `Hero` and finding the first word in the DOM).
 *
 *  - The scroll reveal (Req 10.3): under reduced motion `ScrollReveal` renders
 *    its children as the static final frame and constructs NO
 *    IntersectionObserver (framer-motion's `useInView` would build one only on
 *    the motion path). We stub the global `IntersectionObserver` constructor
 *    and assert it is never invoked.
 *
 * jsdom implements neither `window.matchMedia` nor `IntersectionObserver`, so
 * both are stubbed here. `matchMedia` is wired to report
 * `(prefers-reduced-motion: reduce)` as matching.
 */
import { act, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Hero } from "@/components/sections/hero";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import {
  DEFAULT_ROTATION_INTERVAL_MS,
  useRotatingWord,
} from "@/hooks/use-rotating-word";

/**
 * Install a `matchMedia` stub. `reduce` controls whether the
 * `(prefers-reduced-motion: reduce)` query reports a match; the stub honours the
 * query string so other media queries report no match.
 */
function mockMatchMedia(reduce: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("Property 4: Reduced motion (Requirements 10.3, 10.4)", () => {
  describe("Hero rotating word starts no rotation timer (Req 10.4)", () => {
    beforeEach(() => {
      mockMatchMedia(true);
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it("useRotatingWord returns the first word and leaves no active timer", () => {
      const words = ["Diagnostics", "Reports", "Insights"];

      const { result } = renderHook(() => useRotatingWord(words));

      // The first word is shown statically.
      expect(result.current).toBe(words[0]);

      // No rotation timer is left running under reduced motion.
      expect(vi.getTimerCount()).toBe(0);

      // Advancing well past several intervals must not advance the word.
      act(() => {
        vi.advanceTimersByTime(DEFAULT_ROTATION_INTERVAL_MS * 5);
      });

      expect(result.current).toBe(words[0]);
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("Hero renders the first word statically (Req 10.4)", () => {
    beforeEach(() => {
      mockMatchMedia(true);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("renders the first rotating word as static text", () => {
      const rotatingWords = ["Diagnostics", "Reports", "Insights"];

      render(
        <Hero
          headingPrefix="A new era for radiology"
          rotatingWords={rotatingWords}
        />,
      );

      // The first word is present in the rendered headline.
      expect(screen.getByText(rotatingWords[0])).toBeInTheDocument();
    });
  });

  describe("ScrollReveal renders the static frame with no observer (Req 10.3)", () => {
    let observerConstructed: number;

    class SpyIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);

      constructor(
        public callback: IntersectionObserverCallback,
        public options?: IntersectionObserverInit,
      ) {
        observerConstructed += 1;
      }
    }

    beforeEach(() => {
      observerConstructed = 0;
      mockMatchMedia(true);
      vi.stubGlobal("IntersectionObserver", SpyIntersectionObserver);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it("renders children (static final frame) and constructs no IntersectionObserver", () => {
      render(
        <ScrollReveal>
          <p>Revealed content</p>
        </ScrollReveal>,
      );

      // The children render immediately as the static final frame.
      expect(screen.getByText("Revealed content")).toBeInTheDocument();

      // No IntersectionObserver is created on the reduced-motion path.
      expect(observerConstructed).toBe(0);
    });
  });
});
