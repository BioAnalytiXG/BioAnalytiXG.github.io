import Link from "next/link";
import {
  Building2,
  Boxes,
  ShieldCheck,
  Rocket,
  type LucideIcon,
} from "lucide-react";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import MarqueeAwards from "@/components/marquee-awards";

/**
 * "Our impact" section.
 *
 * A two-part band on the `--surface` canvas: a left intro paired with three
 * headline stats, then a full-width "partner with us" CTA card. Matches the
 * reference design's measurable-impact layout.
 *
 * Styling uses the shared `container`, the `py-16 md:py-24` rhythm, design
 * tokens for surfaces/text, a teal accent for stats/icons, and the
 * reduced-motion-aware {@link ScrollReveal} wrapper for entrance.
 */

interface Stat {
  value: string;
  label: string;
  Icon: LucideIcon;
}

const stats: Stat[] = [
  {
    value: "3",
    label: "Clinical & academic partners collaborating with us",
    Icon: Building2,
  },
  {
    value: "1",
    label: "University pilot in progress",
    Icon: Boxes,
  },
  {
    value: "99%+",
    label: "Focus on security and data privacy",
    Icon: ShieldCheck,
  },
];

export function Impact() {
  return (
    <section id="impact" className="bg-surface py-16 md:py-24">
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Intro */}
          <ScrollReveal className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
              Our impact
            </p>
            <h2 className="mt-3 text-foreground">
              Real results.
              <br />
              Measurable impact.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              We combine cutting-edge research with practical applications that
              improve outcomes.
            </p>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal delay={120} className="min-w-0">
            <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.value}>
                  <stat.Icon
                    aria-hidden="true"
                    className="size-6 text-primary"
                    strokeWidth={1.75}
                  />
                  <dt className="mt-3 text-4xl font-bold tracking-[-0.02em] text-foreground">
                    {stat.value}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </ScrollReveal>
        </div>

        {/* Awards & recognition */}
        <ScrollReveal delay={140} className="mt-14">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
            Awards &amp; recognition
          </p>
          <div className="mt-6">
            <MarqueeAwards />
          </div>
        </ScrollReveal>

        {/* Partner CTA card */}
        <ScrollReveal delay={160} className="mt-14">
          <div className="flex flex-col items-start gap-6 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                <Rocket aria-hidden="true" className="size-6" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="text-foreground">Building the future with AI</h3>
                <p className="mt-1.5 max-w-xl text-base leading-relaxed text-muted">
                  We partner with institutions and innovators to create AI
                  solutions that make a real difference.
                </p>
              </div>
            </div>

            <Link
              href="/#contact"
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:w-auto"
            >
              Partner with us
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default Impact;
