"use client";

import { cn } from "@/lib/utils";
import { GridAccent } from "@/components/aceternity/grid-accent";
import { SpotlightAccent } from "@/components/aceternity/spotlight-accent";

/**
 * Combined light-friendly hero background accent.
 *
 * Layers the faint {@link GridAccent} structural grid beneath the soft
 * {@link SpotlightAccent} gradient wash to produce the subtle, low-contrast
 * backdrop the Visual Design Language calls for — a light-tuned grid + spotlight
 * instead of a dark particle field.
 *
 * Both child accents independently respect `prefers-reduced-motion` (rendering a
 * static final frame with no timers/observers per Requirement 10.3) and drift
 * continuously when motion is allowed (Requirement 10.2). The wrapper is
 * absolutely positioned and `aria-hidden`, so the hero only needs to mark its
 * container `relative` and place content above it.
 *
 * Intended to be lazy-loaded by the hero (task 7.2) via `next/dynamic`:
 *
 * ```tsx
 * const HeroBackground = dynamic(
 *   () => import("@/components/aceternity/hero-background"),
 *   { ssr: false },
 * );
 * ```
 *
 * The `default` export below makes that dynamic import ergonomic; the named
 * sub-accents remain individually importable for other sections.
 */
export interface HeroBackgroundProps {
  /** Grid cell size in pixels (forwarded to {@link GridAccent}). */
  gridCellSize?: number;
  /** Grid line opacity 0–1 (forwarded to {@link GridAccent}). */
  gridLineOpacity?: number;
  /** Primary wash opacity 0–1 (forwarded to {@link SpotlightAccent}). */
  spotlightPrimaryOpacity?: number;
  /** Accent wash opacity 0–1 (forwarded to {@link SpotlightAccent}). */
  spotlightAccentOpacity?: number;
  className?: string;
}

export function HeroBackground({
  gridCellSize,
  gridLineOpacity,
  spotlightPrimaryOpacity,
  spotlightAccentOpacity,
  className,
}: HeroBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <GridAccent cellSize={gridCellSize} lineOpacity={gridLineOpacity} />
      <SpotlightAccent
        primaryOpacity={spotlightPrimaryOpacity}
        accentOpacity={spotlightAccentOpacity}
      />
    </div>
  );
}

export default HeroBackground;
