import type { ReactNode } from "react";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  /** Small uppercase eyebrow/kicker rendered above the title (`overline` token). */
  eyebrow: string;
  /** Bold page title rendered as the page's single `h1`. */
  title: ReactNode;
  /** Supporting `lead` subhead beneath the title. */
  subhead?: ReactNode;
  /** Optional extra content (e.g. CTAs) rendered below the subhead. */
  children?: ReactNode;
  className?: string;
}

/**
 * Shared page-header band (design.md "Cross-Page Layout Pattern").
 *
 * The consistent top band for inner routes: an `overline` eyebrow in
 * `--primary`, a bold `h1` title, and a `lead` subhead on the `--background`
 * canvas — no dark hero — inside the standard `max-w-7xl` container with the
 * `py-16 md:py-24` section rhythm. Styling is token-only (no color literals),
 * and the band reveals on load through the reduced-motion-aware
 * {@link ScrollReveal} wrapper.
 */
export function PageHeader({
  eyebrow,
  title,
  subhead,
  children,
  className,
}: PageHeaderProps) {
  return (
    <section className={cn("bg-background py-16 md:py-24", className)}>
      <div className="container">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-balance text-foreground">{title}</h1>
          {subhead ? (
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              {subhead}
            </p>
          ) : null}
          {children ? <div className="mt-10">{children}</div> : null}
        </ScrollReveal>
      </div>
    </section>
  );
}

export default PageHeader;
