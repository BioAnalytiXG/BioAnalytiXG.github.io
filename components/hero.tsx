import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HeroIllustration } from "@/components/hero-illustration";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ChartLineDefault } from "@/components/chart-line-default";
import MarqueePartners from "@/components/marquee-partners";

/**
 * Home hero (split layout).
 *
 * Left column carries the brand positioning copy — an eyebrow, a bold display
 * headline with a teal "see deeper." accent, supporting lead, two CTAs, and a
 * low-key "trusted by" partner strip. The right column renders {@link HeroVisual},
 * a lightweight CSS/SVG mock of the Orasis AI workspace with a floating
 * "clinically validated" card, so the section needs no bitmap asset.
 *
 * Layout uses the shared `container`, the standard `py-16 md:py-24` rhythm, and
 * the reduced-motion-aware {@link ScrollReveal} wrapper for entrance.
 */

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft ambient background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-24 h-[36rem] w-[36rem] rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="absolute -left-40 top-48 h-[28rem] w-[28rem] rounded-full bg-primary/[0.05] blur-3xl" />
      </div>

      <div className="container py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy column */}
          <ScrollReveal className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
              AI for healthcare &amp; education
            </p>

            <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
              Intelligent AI products that{" "}
              <span className="text-primary">see deeper.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              BioAnalytiX builds advanced AI solutions that empower professionals
              and learners to make faster, smarter, and more confident decisions.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                href="/product"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Our Products
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                About BioAnalytiX
              </Link>
            </div>

            {/* Trust strip */}
            <div className="mt-14">
              <p className="text-xs font-medium text-muted">
                Trusted by partners and institutions
              </p>
              <div className="mt-5">
                <MarqueePartners />
              </div>
            </div>
          </ScrollReveal>

          {/* Visual column */}
          <ScrollReveal delay={120} className="min-w-0">
            <HeroVisual />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Hero product visual. Renders the {@link HeroIllustration} SVG scene with a
 * floating {@link ChartLineDefault} card overlay for polish.
 */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md sm:max-w-xl">
      {/* Vector hero illustration */}
      <HeroIllustration className="h-auto w-full" />

      {/* Floating line-chart card — scaled down on small screens so it stays
          clear of the illustration edge and never overflows the viewport. */}
      <div className="absolute -bottom-4 right-0 origin-bottom-right scale-[0.78] sm:-bottom-6 sm:right-2 sm:scale-100">
        <ChartLineDefault />
      </div>
    </div>
  );
}
