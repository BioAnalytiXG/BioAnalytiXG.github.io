"use client";

import { useEffect, useRef, useState } from "react";

/** Default rotation interval in milliseconds (Requirement 10.2). */
export const DEFAULT_ROTATION_INTERVAL_MS = 3000;
/** Lower bound for the configurable rotation interval (Requirement 10.2). */
export const MIN_ROTATION_INTERVAL_MS = 1000;
/** Upper bound for the configurable rotation interval (Requirement 10.2). */
export const MAX_ROTATION_INTERVAL_MS = 10000;

/**
 * Clamp a configured interval into the bounded range [1000, 10000] ms.
 *
 * Finite, in-range values are used as-is; finite out-of-range values are
 * clamped to the nearest bound; non-finite / non-numeric values fall back to
 * the default (Requirement 10.2).
 */
function clampInterval(intervalMs: number): number {
  if (!Number.isFinite(intervalMs)) {
    return DEFAULT_ROTATION_INTERVAL_MS;
  }
  if (intervalMs < MIN_ROTATION_INTERVAL_MS) {
    return MIN_ROTATION_INTERVAL_MS;
  }
  if (intervalMs > MAX_ROTATION_INTERVAL_MS) {
    return MAX_ROTATION_INTERVAL_MS;
  }
  return intervalMs;
}

/**
 * Read the current `prefers-reduced-motion` preference.
 *
 * Implemented locally via `window.matchMedia` (rather than a shared detector)
 * so the hero rotation hook is self-contained. Returns `false` during SSR /
 * prerender where `window` is unavailable.
 */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Cycle through a list of words on a bounded, configurable interval.
 *
 * Replaces the legacy jQuery typing effect with a deterministic,
 * reduced-motion-aware cycle.
 *
 * Behaviour:
 * - Advances sequentially every `intervalMs`, looping back to the first word
 *   after the last (Requirements 10.2, 11.4).
 * - `intervalMs` is clamped into [1000, 10000] ms, defaulting to 3000 ms
 *   (Requirement 10.2).
 * - Under `prefers-reduced-motion: reduce`, returns `words[0]` and starts no
 *   timer (Requirements 10.4, 11.1).
 * - Maintains the index invariant `0 <= index < words.length` for every
 *   emitted value (Requirement 11.3).
 * - Clears its timer on unmount and before re-running setup, so at most one
 *   timer is active per hook instance (Requirements 11.1, 11.5).
 *
 * @param words Non-empty list of words to cycle through.
 * @param intervalMs Optional rotation interval in ms (default 3000, bounded 1000–10000).
 * @returns The word at the current index.
 */
export function useRotatingWord(
  words: string[],
  intervalMs: number = DEFAULT_ROTATION_INTERVAL_MS
): string {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  // Keep the latest word count available to the interval callback without
  // forcing the timer effect to re-run when only the array reference changes.
  const wordCountRef = useRef(words.length);
  wordCountRef.current = words.length;

  // Track the `prefers-reduced-motion` preference and respond to changes
  // during the session without requiring a reload.
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);

    return () => {
      query.removeEventListener("change", onChange);
    };
  }, []);

  const clampedInterval = clampInterval(intervalMs);
  const wordCount = words.length;

  // Drive the rotation timer. Re-runs (clearing the previous timer first) when
  // the word count, interval, or reduced-motion preference changes.
  useEffect(() => {
    // Reset to the first word whenever setup re-runs so the emitted index is
    // always valid for the current `words` list (Requirement 11.3).
    setIndex(0);

    // No timer under reduced motion, when there is nothing to cycle, or when
    // a single word makes rotation a no-op (Requirements 10.4, 11.1).
    if (reduced || wordCount <= 1) {
      return;
    }

    const timer = setInterval(() => {
      // Advance sequentially, looping to 0 after the final index
      // (Requirements 11.3, 11.4).
      setIndex((current) => (current + 1) % wordCountRef.current);
    }, clampedInterval);

    return () => {
      clearInterval(timer);
    };
  }, [reduced, wordCount, clampedInterval]);

  if (wordCount === 0) {
    return "";
  }

  // Modulo guard keeps the read valid even if `index` briefly lags a shrunk
  // `words` list before the reset effect runs (Requirement 11.3).
  return words[index % wordCount];
}
