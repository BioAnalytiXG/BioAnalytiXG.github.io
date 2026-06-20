"use client";

import { type CSSProperties } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Light-friendly soft gradient-spotlight accent (Aceternity "Spotlight" /
 * "Background Gradient" family).
 *
 * Renders one or two soft radial color washes built from the brand tokens
 * (`--primary`, `--accent`) at low alpha, heavily blurred, to add depth and a
 * gentle glow behind the headline without darkening the canvas. This is the
 * light-tuned alternative to a dark particle/aurora field (Visual Design
 * Language: "avoid" list).
 *
 * Motion (Requirements 10.2, 10.3):
 *  - When motion is allowed, the spotlight drifts/breathes slowly and
 *    continuously (subtle translate + scale loop).
 *  - When `prefers-reduced-motion: reduce` is set, it renders the static final
 *    frame as a plain element: no framer-motion loop, no timers, no observers.
 */
export interface SpotlightAccentProps {
  /** Opacity (0–1) of the primary-color wash. Kept low for a soft glow. */
  primaryOpacity?: number;
  /** Opacity (0–1) of the supporting accent-color wash. */
  accentOpacity?: number;
  /** Drift/breathe duration in seconds for the (motion-allowed) loop. */
  durationSeconds?: number;
  className?: string;
}

const DEFAULT_PRIMARY_OPACITY = 0.16;
const DEFAULT_ACCENT_OPACITY = 0.1;
const DEFAULT_DURATION_SECONDS = 18;

function washStyle(
  primaryOpacity: number,
  accentOpacity: number,
): CSSProperties {
  // Token-derived radial washes. `hsl(var(--token) / alpha)` keeps the color
  // sourced from the design system (first arg is `var`, not a raw literal).
  const primaryWash = `radial-gradient(40% 50% at 30% 30%, hsl(var(--primary) / ${primaryOpacity}), transparent 70%)`;
  const accentWash = `radial-gradient(45% 55% at 75% 25%, hsl(var(--accent) / ${accentOpacity}), transparent 72%)`;
  return {
    backgroundImage: `${primaryWash}, ${accentWash}`,
    filter: "blur(40px)",
  };
}

export function SpotlightAccent({
  primaryOpacity = DEFAULT_PRIMARY_OPACITY,
  accentOpacity = DEFAULT_ACCENT_OPACITY,
  durationSeconds = DEFAULT_DURATION_SECONDS,
  className,
}: SpotlightAccentProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const style = washStyle(primaryOpacity, accentOpacity);

  // Reduced motion: static final frame, no animation loop / timers / observers.
  if (prefersReducedMotion) {
    return (
      <div
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-0", className)}
        style={style}
      />
    );
  }

  // Motion allowed: slow, low-amplitude drift + breathe loop.
  return (
    <motion.div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={style}
      animate={{
        x: ["-2%", "2%", "-2%"],
        y: ["-1.5%", "1.5%", "-1.5%"],
        scale: [1, 1.06, 1],
      }}
      transition={{
        duration: durationSeconds,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
      }}
    />
  );
}

export default SpotlightAccent;
