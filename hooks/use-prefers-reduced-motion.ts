"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Reads the current value of the reduced-motion media query.
 * Returns `false` during SSR / when `matchMedia` is unavailable so the
 * first client render matches the server-rendered (motion-allowed) markup.
 */
function getInitialPreference(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(QUERY).matches;
}

/**
 * Shared `prefers-reduced-motion` detector.
 *
 * This is the single source of truth other motion components consume. It
 * subscribes to the media query's `change` event so that when a visitor
 * toggles their OS reduced-motion setting mid-session, consumers re-render
 * with the new value well within 1000ms and without a page reload
 * (Requirement 10.5).
 *
 * @returns `true` when the visitor has requested reduced motion.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState<boolean>(getInitialPreference);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQueryList = window.matchMedia(QUERY);

    // Sync immediately in case the preference changed between the initial
    // (SSR-safe) render and effect execution.
    setPrefersReducedMotion(mediaQueryList.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers expose addEventListener; older Safari uses addListener.
    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", handleChange);
      return () => mediaQueryList.removeEventListener("change", handleChange);
    }

    mediaQueryList.addListener(handleChange);
    return () => mediaQueryList.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
}

export default usePrefersReducedMotion;
