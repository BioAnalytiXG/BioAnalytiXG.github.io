"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/** Reveal offset bounds (px) defined by Requirement 10.1. */
const MIN_OFFSET_PX = 16;
const MAX_OFFSET_PX = 48;
const DEFAULT_OFFSET_PX = 24;

/** Reveal duration bounds (ms) defined by Requirement 10.1. */
const MIN_DURATION_MS = 200;
const MAX_DURATION_MS = 800;
const DEFAULT_DURATION_MS = 500;

/** Fraction of the element that must be visible to trigger (10% per Req 10.1). */
const VIEWPORT_AMOUNT = 0.1;

export interface ScrollRevealProps {
  children: ReactNode;
  /** Starting vertical offset in pixels; clamped to 16–48 (Req 10.1). */
  offset?: number;
  /** Transition duration in milliseconds; clamped to 200–800 (Req 10.1). */
  duration?: number;
  /** Optional delay (ms) for staggering grouped reveals. */
  delay?: number;
  className?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Motion-enabled reveal. Uses a single IntersectionObserver (via framer-motion's
 * `useInView`) that fires once: when at least 10% of the element enters the
 * viewport it fades opacity 0→1 and translates y from `offset` to 0, completing
 * within the configured (clamped) duration. `once: true` guarantees the
 * transition plays only once per element per page load (Req 10.1).
 */
function MotionReveal({
  children,
  offset = DEFAULT_OFFSET_PX,
  duration = DEFAULT_DURATION_MS,
  delay = 0,
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: VIEWPORT_AMOUNT });

  const resolvedOffset = clamp(offset, MIN_OFFSET_PX, MAX_OFFSET_PX);
  const resolvedDurationMs = clamp(duration, MIN_DURATION_MS, MAX_DURATION_MS);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: resolvedOffset }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: resolvedOffset }}
      transition={{
        duration: resolvedDurationMs / 1000,
        delay: Math.max(delay, 0) / 1000,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Reduced-motion variant. Renders the static final frame (fully visible, no
 * translation) with no IntersectionObserver and no timers (Req 10.3).
 */
function StaticReveal({ children, className }: ScrollRevealProps) {
  return <div className={className}>{children}</div>;
}

/**
 * Scroll-reveal wrapper.
 *
 * When motion is allowed, children fade and rise into place once as they enter
 * the viewport. When `prefers-reduced-motion: reduce` is set, the wrapper renders
 * the static final frame immediately, registering no observer and starting no
 * timers. The choice is driven by the shared {@link usePrefersReducedMotion}
 * detector, so toggling the OS preference mid-session swaps behavior without a
 * reload (Req 10.5).
 */
export function ScrollReveal(props: ScrollRevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <StaticReveal {...props} />;
  }

  return <MotionReveal {...props} />;
}

export default ScrollReveal;
