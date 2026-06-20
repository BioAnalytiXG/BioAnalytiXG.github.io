"use client";

import { useEffect, useRef, useState } from "react";

import { TrendingUp } from "lucide-react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Mini dashboard analytics card with an animated plot.
 *
 * On a loop, the line/area chart "draws" itself, the progress bar fills, and the
 * percentage counts up — as if the data is loading in. Honors
 * `prefers-reduced-motion` by showing the final state statically.
 */
const TARGET = 83; // overall progress %
const CYCLE_MS = 5200;
const COUNT_MS = 1500;

// Trending-up sparkline (normalised pathLength so the draw animation is exact).
const LINE_D = "M2 44 L35 38 L68 41 L101 28 L134 32 L167 18 L198 12";
const AREA_D = `${LINE_D} L198 54 L2 54 Z`;

const keyframes = `
@keyframes dashmini-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes dashmini-area { from { opacity: 0; } to { opacity: 1; } }
@keyframes dashmini-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@media (prefers-reduced-motion: reduce) {
  [data-dashmini] { animation: none !important; }
}
`;

export function DashboardMiniDemo() {
  const reduced = usePrefersReducedMotion();
  const [cycle, setCycle] = useState(0);
  const [count, setCount] = useState(reduced ? TARGET : 0);
  const raf = useRef<number | null>(null);

  // Re-trigger the animation on a loop.
  useEffect(() => {
    if (reduced) {
      setCount(TARGET);
      return;
    }
    const id = setInterval(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, [reduced]);

  // Count the percentage up each cycle.
  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * TARGET));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    setCount(0);
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [cycle, reduced]);

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <style>{keyframes}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-muted">
          This week
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-1.5 py-0.5 text-[0.6rem] font-semibold text-brand-ink">
          <TrendingUp className="size-3" />
          +5%
        </span>
      </div>

      <div className="mt-0.5 text-2xl font-bold tracking-[-0.02em] text-foreground">
        {count}%
      </div>

      {/* Animated plot */}
      <div className="mt-1.5">
        <svg
          viewBox="0 0 200 56"
          className="h-12 w-full overflow-visible"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="dashmini-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.28" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area */}
          <path
            key={`area-${cycle}`}
            data-dashmini
            d={AREA_D}
            fill="url(#dashmini-fill)"
            style={{
              animation: reduced ? undefined : "dashmini-area 1.6s ease-out both",
            }}
          />

          {/* Line (draws via normalised dash) */}
          <path
            key={`line-${cycle}`}
            data-dashmini
            d={LINE_D}
            pathLength={1}
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 1,
              strokeDashoffset: reduced ? 0 : undefined,
              animation: reduced
                ? undefined
                : "dashmini-draw 1.5s cubic-bezier(0.4,0,0.2,1) both",
            }}
          />

          {/* Endpoint dot */}
          <circle
            key={`dot-${cycle}`}
            data-dashmini
            cx={198}
            cy={12}
            r={3}
            fill="hsl(var(--primary))"
            style={{
              animation: reduced ? undefined : "dashmini-area 0.4s ease-out 1.4s both",
              opacity: reduced ? 1 : 0,
            }}
          />
        </svg>
      </div>

      {/* Pills */}
      <div className="mt-2 flex gap-1.5">
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[0.6rem] font-semibold text-brand-ink">
          2 missions
        </span>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[0.6rem] font-semibold text-brand-ink">
          1 quiz
        </span>
      </div>

      {/* Progress bar (fills each cycle) */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          key={`bar-${cycle}`}
          data-dashmini
          className="h-full rounded-full bg-primary"
          style={{
            width: `${TARGET}%`,
            transformOrigin: "left",
            animation: reduced ? undefined : "dashmini-bar 1.5s cubic-bezier(0.4,0,0.2,1) both",
          }}
        />
      </div>
    </div>
  );
}

export default DashboardMiniDemo;
