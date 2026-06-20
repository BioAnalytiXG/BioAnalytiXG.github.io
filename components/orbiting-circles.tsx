import React from "react";

/**
 * Orbiting circles — children are evenly distributed around a circular path and
 * animated to orbit the center via a pure-CSS keyframe (no JS timers).
 *
 * Adapted to honor `prefers-reduced-motion` (the orbit holds its position) and
 * to be theme-token friendly (the guide ring uses `--border`). The parent must
 * be a `relative` flex container centered on both axes so each item's static
 * position is the center before the orbit transform is applied.
 */
const orbitKeyframes = `
@keyframes orbit {
  0% {
    transform: rotate(var(--angle, 0deg)) translateY(var(--radius, 50px)) rotate(calc(var(--angle, 0deg) * -1));
  }
  100% {
    transform: rotate(calc(var(--angle, 0deg) + 360deg)) translateY(var(--radius, 50px)) rotate(calc(var(--angle, 0deg) * -1 - 360deg));
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-orbit] { animation: none !important; }
}
`;

export interface OrbitingCirclesProps {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
  iconSize?: number;
  speed?: number;
}

export function OrbitingCircleIcons({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 0,
  radius = 160,
  path = true,
  iconSize = 30,
  speed = 1,
}: OrbitingCirclesProps) {
  const calculatedDuration = duration / speed;

  return (
    <>
      <style>{orbitKeyframes}</style>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute inset-0 size-full"
          aria-hidden="true"
        >
          <circle
            className="stroke-border"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            strokeWidth={1}
          />
        </svg>
      )}
      {React.Children.map(children, (child, index) => {
        const angle = (360 / React.Children.count(children)) * index;
        return (
          <div
            data-orbit
            style={
              {
                "--angle": `${angle}deg`,
                "--radius": `${radius}px`,
                position: "absolute",
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transformOrigin: "center center",
                animation: `orbit ${calculatedDuration}s linear ${
                  delay ? `-${delay}s` : "0s"
                } infinite ${reverse ? "reverse" : "normal"}`,
              } as React.CSSProperties
            }
            className={className}
          >
            {child}
          </div>
        );
      })}
    </>
  );
}

export default OrbitingCircleIcons;
