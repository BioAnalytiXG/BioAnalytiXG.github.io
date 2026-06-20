"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useRotatingWord } from "@/hooks/use-rotating-word";

/**
 * Bold, light home-page hero (replaces the legacy particles.js + jQuery typing
 * effect).
 *
 * Composition (Home Page Section Design, item 1 + Component: Animated Hero):
 *  - an `overline` eyebrow,
 *  - a `display`-scale headline whose final word rotates through
 *    {@link HeroProps.rotatingWords} in the `--primary` accent color,
 *  - a `lead` supporting paragraph,
 *  - a primary CTA ("Request beta access") and a secondary CTA ("Learn more"),
 *  - all sitting above a subtle, light-friendly Aceternity grid/spotlight accent.
 *
 * The rotating word is driven by {@link useRotatingWord}, which advances on a
 * bounded interval, loops after the last word, and — under
 * `prefers-reduced-motion: reduce` — renders the first word statically and
 * starts no timer (Requirements 10.2, 10.4). The Aceternity accent is
 * lazy-loaded via `next/dynamic` (`ssr: false`) so it never blocks first paint
 * and only hydrates on the client; it is absolutely positioned behind the
 * `relative` content container and independently respects reduced motion.
 *
 * Styling derives entirely from named design tokens (no color literals) per the
 * Visual Design Language (Requirement 12.2).
 */
const HeroBackground = dynamic(
  () => import("@/components/aceternity/hero-background"),
  { ssr: false },
);

/** A single call-to-action descriptor (label + destination). */
export interface HeroCta {
  label: string;
  href: string;
}

export interface HeroProps {
  /** Eyebrow/overline kicker above the headline. */
  overline?: string;
  /** Leading portion of the headline, e.g. "A NEW ERA FOR RADIOLOGY". */
  headingPrefix?: string;
  /** Words cycled in the `--primary` accent at the end of the headline. */
  rotatingWords?: string[];
  /** Supporting `lead` paragraph beneath the headline. */
  subcopy?: string;
  /** Primary (solid) call-to-action. */
  primaryCta?: HeroCta;
  /** Secondary (outline) call-to-action. */
  secondaryCta?: HeroCta;
  className?: string;
}

/** Sensible defaults derived from the legacy content + design direction. */
const DEFAULT_OVERLINE = "AI-Powered Medical Imaging";
const DEFAULT_HEADING_PREFIX = "A new era for radiology";
const DEFAULT_ROTATING_WORDS = [
  "Diagnostics",
  "Reports",
  "Insights",
  "Imaging",
  "Care",
];
const DEFAULT_SUBCOPY =
  "BioAnalytiX builds clinically validated AI that helps radiologists detect anomalies faster and with greater accuracy — turning brain CT scans into actionable insight.";
const DEFAULT_PRIMARY_CTA: HeroCta = {
  label: "Request beta access",
  href: "/careers",
};
const DEFAULT_SECONDARY_CTA: HeroCta = {
  label: "Learn more",
  href: "/product",
};

export function Hero({
  overline = DEFAULT_OVERLINE,
  headingPrefix = DEFAULT_HEADING_PREFIX,
  rotatingWords = DEFAULT_ROTATING_WORDS,
  subcopy = DEFAULT_SUBCOPY,
  primaryCta = DEFAULT_PRIMARY_CTA,
  secondaryCta = DEFAULT_SECONDARY_CTA,
  className,
}: HeroProps) {
  const rotatingWord = useRotatingWord(rotatingWords);

  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className={cn(
        "relative isolate overflow-hidden bg-background",
        "py-24 md:py-32",
        className,
      )}
    >
      {/* Light-friendly Aceternity grid/spotlight accent (lazy, client-only). */}
      <HeroBackground />

      {/* Content sits above the accent. */}
      <div className="container relative z-10 flex flex-col items-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {overline}
        </p>

        <h1
          id="hero-heading"
          className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl"
        >
          {headingPrefix}{" "}
          <span className="text-primary" aria-live="polite">
            {rotatingWord}
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {subcopy}
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href={primaryCta.href}
            className={cn(buttonVariants({ variant: "default", size: "lg" }))}
          >
            {primaryCta.label}
          </Link>
          <Link
            href={secondaryCta.href}
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
          >
            {secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
