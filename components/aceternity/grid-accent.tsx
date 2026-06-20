"use client";

import { type CSSProperties } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Light-friendly faint grid accent (Aceternity "Background Grid" family).
 *
 * Renders a low-contrast square grid behind hero/section content. Lines are
 * drawn with token-derived colors (`hsl(var(--foreground) / <low alpha>)`) so
 * the grid reads as a faint structural texture on the near-white canvas — never
 * a dark glowing field (Visual Design Language: "use" list). The grid is masked
 * with a soft radial fade so it dissolves toward the edges.
 *
 * Motion (Requirements 10.2, 10.3):
 *  - When motion is allowed, the grid drifts very slowly and continuously via a
 *    looping `backgroundPosition` animation — subtle, low-contrast, behind the
 *    headline.
 *  - When `prefers-reduced-motion: reduce` is set, it renders the static final
 *    frame as a plain element: no framer-motion animation loop, no timers, and
 *    no observers.
 */
export interface GridAccentProps {
  /** Grid cell size in pixels. */
  cellSize?: number;
  /**
   * Line opacity (0–1) applied to the token color. Kept low so the grid stays
   * faint and light-friendly.
   */
  lineOpacity?: number;
  /** Drift duration in seconds for the (motion-allowed) slow loop. */
  durationSeconds?: number;
  className?: string;
}

const DEFAULT_CELL_SIZE = 56;
const DEFAULT_LINE_OPACITY = 0.05;
const DEFAULT_DURATION_SECONDS = 40;

/** Build the two-line (vertical + horizontal) grid background image. */
function gridStyle(cellSize: number, lineOpacity: number): CSSProperties {
  // `hsl(var(--token) / alpha)` is token-derived (first arg is `var`, not a raw
  // numeric literal) so it stays within the design-system token rules.
  const line = `hsl(var(--foreground) / ${lineOpacity})`;
  return {
    backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
    backgroundSize: `${cellSize}px ${cellSize}px`,
    // Fade the grid out toward the edges so it never frames the content hard.
    WebkitMaskImage:
      "radial-gradient(ellipse at center, black 35%, transparent 75%)",
    maskImage: "radial-gradient(ellipse at center, black 35%, transparent 75%)",
  };
}

export function GridAccent({
  cellSize = DEFAULT_CELL_SIZE,
  lineOpacity = DEFAULT_LINE_OPACITY,
  durationSeconds = DEFAULT_DURATION_SECONDS,
  className,
}: GridAccentProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const style = gridStyle(cellSize, lineOpacity);

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

  // Motion allowed: very slow, continuous drift of the grid by one cell.
  return (
    <motion.div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={style}
      animate={{
        backgroundPosition: [
          "0px 0px",
          `${cellSize}px ${cellSize}px`,
        ],
      }}
      transition={{
        duration: durationSeconds,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      }}
    />
  );
}

export default GridAccent;
