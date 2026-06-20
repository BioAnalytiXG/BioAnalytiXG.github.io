import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Extra classes applied to the marquee container. */
  className?: string;
  /** Reverse the scroll direction. */
  reverse?: boolean;
  /** Pause the animation while the pointer is over the marquee. */
  pauseOnHover?: boolean;
  /** Content to scroll. */
  children?: React.ReactNode;
  /** Scroll vertically instead of horizontally. */
  vertical?: boolean;
  /** How many times the children are repeated to create a seamless loop. */
  repeat?: number;
}

/**
 * Infinite, reduced-motion-friendly marquee.
 *
 * Children are repeated `repeat` times and translated with the `marquee`
 * keyframes (wired in `tailwind.config.ts`). Speed is controlled by the
 * `--duration` CSS variable and spacing by `--gap`, both overridable via
 * `className` (e.g. `[--duration:20s]`).
 */
export function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className,
      )}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
            "animate-marquee flex-row": !vertical,
            "animate-marquee-vertical flex-col": vertical,
            "group-hover:[animation-play-state:paused]": pauseOnHover,
            "[animation-direction:reverse]": reverse,
          })}
          aria-hidden={i > 0 ? true : undefined}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

export default Marquee;
