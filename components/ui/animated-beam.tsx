"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface AnimatedBeamProps {
  className?: string;
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  /** Route as a rounded right-angle elbow through a shared vertical trunk. */
  orthogonal?: boolean;
  /** Distance (px) the trunk sits to the left of the end point (orthogonal mode). */
  trunkOffset?: number;
  /** Corner radius for the orthogonal elbows. */
  cornerRadius?: number;
  /** Length (px) of the travelling light segment. */
  beamLength?: number;
  /** Calm pause (s) between travel cycles. */
  repeatDelay?: number;
}

/**
 * Animated connector beam between two elements.
 *
 * Draws an SVG path from `fromRef` to `toRef` (measured relative to
 * `containerRef`) and sends a short, soft light segment travelling along the
 * actual path geometry using `stroke-dasharray` / `stroke-dashoffset`. Because
 * the dash rides the real path, it tracks straight lines and rounded elbows
 * exactly, moving at a constant speed. Positions are recomputed via a
 * `ResizeObserver`, and the motion is disabled under `prefers-reduced-motion`.
 */
export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  duration = 5,
  delay = 0,
  pathColor = "hsl(var(--border))",
  pathWidth = 2,
  pathOpacity = 1,
  gradientStartColor = "#4C8A99",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  orthogonal = false,
  trunkOffset = 44,
  cornerRadius = 16,
  beamLength = 38,
  repeatDelay = 0.8,
}: AnimatedBeamProps) {
  const reduced = usePrefersReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const [pathD, setPathD] = useState("");
  const [pathLength, setPathLength] = useState(0);
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const rectA = fromRef.current.getBoundingClientRect();
      const rectB = toRef.current.getBoundingClientRect();

      setSvgDimensions({ width: containerRect.width, height: containerRect.height });

      const startX = rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
      const startY = rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
      const endX = rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
      const endY = rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

      if (orthogonal) {
        const trunkX = endX - trunkOffset;
        const dirY = Math.sign(endY - startY);
        const r = Math.max(
          0,
          Math.min(
            cornerRadius,
            Math.abs(endY - startY) / 2,
            Math.abs(trunkX - startX),
            Math.abs(endX - trunkX),
          ),
        );

        if (dirY === 0 || r < 0.5) {
          // Same row → straight horizontal connector.
          setPathD(`M ${startX},${startY} L ${endX},${endY}`);
        } else {
          setPathD(
            `M ${startX},${startY} ` +
              `L ${trunkX - r},${startY} ` +
              `Q ${trunkX},${startY} ${trunkX},${startY + dirY * r} ` +
              `L ${trunkX},${endY - dirY * r} ` +
              `Q ${trunkX},${endY} ${trunkX + r},${endY} ` +
              `L ${endX},${endY}`,
          );
        }
        return;
      }

      const controlX = (startX + endX) / 2;
      const controlY = (startY + endY) / 2 - curvature;
      setPathD(`M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`);
    };

    const ro = new ResizeObserver(() => updatePath());
    if (containerRef.current) ro.observe(containerRef.current);
    updatePath();
    return () => ro.disconnect();
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
    orthogonal,
    trunkOffset,
    cornerRadius,
  ]);

  // Measure the rendered path so the dash can be sized/looped against its real length.
  useEffect(() => {
    if (!pathRef.current) return;
    const length = pathRef.current.getTotalLength();
    if (Number.isFinite(length) && length > 0) setPathLength(length);
  }, [pathD, svgDimensions.width, svgDimensions.height]);

  const seg = Math.min(beamLength, Math.max(12, pathLength * 0.35));

  return (
    <>
      {/* Static track layer (kept beneath every comet via z-index) */}
      <svg
        fill="none"
        width={svgDimensions.width}
        height={svgDimensions.height}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-0 transform-gpu",
          className,
        )}
      >
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke={pathColor}
          strokeWidth={pathWidth}
          strokeOpacity={pathOpacity}
          strokeLinecap="round"
        />
      </svg>

      {/* Travelling light layer (always above all tracks, below the nodes) */}
      {pathD && pathLength > 0 && !reduced ? (
        <svg
          fill="none"
          width={svgDimensions.width}
          height={svgDimensions.height}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-[1] transform-gpu"
        >
          <motion.path
            d={pathD}
            fill="none"
            stroke={gradientStartColor}
            strokeWidth={pathWidth + 1}
            strokeLinecap="round"
            strokeDasharray={`${seg} ${pathLength}`}
            initial={{ strokeDashoffset: seg }}
            animate={{ strokeDashoffset: -pathLength }}
            transition={{
              duration,
              delay,
              ease: "linear",
              repeat: Infinity,
              repeatDelay,
            }}
            style={{ filter: `drop-shadow(0 0 2px ${gradientStartColor})` }}
          />
        </svg>
      ) : null}
    </>
  );
}

export default AnimatedBeam;
