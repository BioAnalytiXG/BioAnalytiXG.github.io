"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-spy hook that tracks which section is currently in view.
 *
 * Replaces the legacy jquery.scrollex behaviour with a single
 * `IntersectionObserver` over the provided section ids.
 *
 * Behaviour (Requirements 2.8, 11.2, 11.5):
 * - Returns the id of the section currently in view.
 * - Returns `null` before any section intersects.
 * - Uses a single `IntersectionObserver` for all ids.
 * - Disconnects the observer on unmount and before re-running setup, so at
 *   most one observer is active per hook instance at any time.
 *
 * @param sectionIds Ids of rendered section elements to observe, in document order.
 * @returns The active section id, or `null` before any section intersects.
 */
export function useActiveSection(sectionIds: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Track the latest intersection ratio per observed id so that, when more
  // than one section is intersecting, we can resolve a single active id.
  const ratiosRef = useRef<Map<string, number>>(new Map());

  // Serialize the ids so the effect only re-runs when the set of ids actually
  // changes, not on every render that passes a new array reference.
  const idsKey = sectionIds.join("|");

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const ids = idsKey ? idsKey.split("|") : [];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) {
      return;
    }

    const ratios = ratiosRef.current;
    ratios.clear();

    const resolveActive = () => {
      let bestId: string | null = null;
      let bestRatio = 0;

      // Prefer the section with the greatest visible ratio; ties resolve to
      // the earliest id in the provided order (document order).
      for (const id of ids) {
        const ratio = ratios.get(id) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      }

      setActiveId(bestRatio > 0 ? bestId : null);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0
          );
        }
        resolveActive();
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );

    for (const element of elements) {
      observer.observe(element);
    }

    // Cleanup runs on unmount and before the effect re-runs (id change),
    // guaranteeing at most one active observer per hook instance.
    return () => {
      observer.disconnect();
      ratios.clear();
    };
  }, [idsKey]);

  return activeId;
}
