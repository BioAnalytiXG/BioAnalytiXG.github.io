"use client";

import { useEffect } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Client-side fragment scroller for the Press page (Requirements 7.3, 7.4).
 *
 * The Press page itself is a server component that renders one element per
 * press article whose `id` equals the article slug. This small client helper
 * runs once after hydration and brings the fragment-addressed article into
 * view:
 *
 *  - WHEN the URL fragment matches the id of a rendered article element, the
 *    matching element is scrolled into view within 1 second of load (Req 7.3).
 *    Scrolling is dispatched on the next animation frame so the article list
 *    has been laid out; `scrollIntoView` resolves synchronously, well inside
 *    the 1s budget.
 *  - IF the fragment matches no rendered element id, the page stays at the top
 *    and raises no error (Req 7.4) — `getElementById` simply returns `null` and
 *    we no-op. `getElementById` is used (rather than a CSS selector lookup) so
 *    an arbitrary/odd fragment value can never throw.
 *
 * The scroll respects `prefers-reduced-motion`: smooth scrolling when motion is
 * allowed, an instant jump when reduced motion is requested. Article elements
 * carry a `scroll-mt-*` offset so the sticky navbar never covers the heading.
 */
export function FragmentScroller() {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Strip the leading "#" and decode (fragments may be percent-encoded).
    const rawHash = window.location.hash;
    if (!rawHash || rawHash === "#") {
      return;
    }

    let id = rawHash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      // Malformed escape sequence — keep the raw value; getElementById is safe.
    }

    let frame = 0;
    const timer = window.setTimeout(() => {
      // Defer to the next frame so the rendered article list is laid out before
      // we measure and scroll. Still completes within the 1s budget (Req 7.3).
      frame = window.requestAnimationFrame(() => {
        const target = document.getElementById(id);
        if (!target) {
          // No matching element: remain at the top, no error (Req 7.4).
          return;
        }
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    }, 0);

    return () => {
      window.clearTimeout(timer);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [prefersReducedMotion]);

  return null;
}

export default FragmentScroller;
