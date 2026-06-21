import Link from "next/link";
import {
  ArrowRight,
  Brain,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

import { ScrollReveal } from "@/components/motion/scroll-reveal";

/**
 * "AI solutions for impact" — the home products section.
 *
 * Surfaces the two BioAnalytiX products as polished, side-by-side cards:
 * Orasis AI (healthcare) and Gnosis AI (education). Each card pairs concise
 * copy and a "Learn more" link with a lightweight CSS/SVG illustration, and the
 * section closes with a single "Explore all products" link.
 *
 * Styling uses the shared `container`, the `py-16 md:py-24` rhythm, design
 * tokens for surfaces/text, and a teal accent (matching the hero) for product
 * highlights. Entrance uses the reduced-motion-aware {@link ScrollReveal}.
 */

const STAGGER_STEP_MS = 100;

export function Solutions() {
  return (
    <section id="products" className="bg-background py-16 md:py-24">
      <div className="container">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
            Our products
          </p>
          <h2 className="mt-3 text-foreground">AI solutions for impact</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Two AI platforms, one vision — built to solve real-world challenges
            in healthcare and education.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Orasis AI — Healthcare */}
          <ScrollReveal className="h-full min-w-0">
            <article className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Brain aria-hidden="true" className="size-6" strokeWidth={1.75} />
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 items-center gap-6 sm:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <div className="flex flex-col items-start gap-3">
                    <img
                      src="/images/orasisai-transparent.png"
                      alt="Orasis AI"
                      className="h-auto w-full max-w-[16rem] brightness-0"
                    />
                    <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-ink">
                      Healthcare
                    </span>
                  </div>
                  <p className="mt-3 text-base leading-relaxed text-muted">
                    AI-powered support for radiologists. Faster, more accurate
                    brain CT analysis with seamless workflow integration.
                  </p>
                  <Link
                    href="/product"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink transition-colors hover:text-brand-ink/80"
                  >
                    Learn more
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>

                <OrasisVisual />
              </div>
            </article>
          </ScrollReveal>

          {/* Gnosis AI — Education */}
          <ScrollReveal delay={STAGGER_STEP_MS} className="h-full min-w-0">
            <article className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <GraduationCap
                    aria-hidden="true"
                    className="size-6"
                    strokeWidth={1.75}
                  />
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 items-center gap-6 sm:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <div className="flex flex-col items-start gap-3">
                    <img
                      src="/images/gnosisai-transparent.png"
                      alt="Gnosis AI"
                      className="h-auto w-full max-w-[11rem]"
                    />
                    <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-ink">
                      Education
                    </span>
                  </div>
                  <p className="mt-3 text-base leading-relaxed text-muted">
                    AI study companion for university students. Personalized
                    learning, grounded in official course material.
                  </p>
                  <Link
                    href="/gnosis-ai"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink transition-colors hover:text-brand-ink/80"
                  >
                    Learn more
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>

                <GnosisVisual />
              </div>
            </article>
          </ScrollReveal>
        </div>

        <ScrollReveal className="mt-10 flex justify-center">
          <Link
            href="/product"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Explore all products
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

/** Brain-scan illustration with corner "targeting" brackets (Orasis AI). */
function OrasisVisual() {
  return (
    <div className="relative hidden size-32 shrink-0 place-items-center sm:grid">
      {/* corner brackets */}
      <span className="absolute left-0 top-0 size-4 rounded-tl border-l-2 border-t-2 border-primary" />
      <span className="absolute right-0 top-0 size-4 rounded-tr border-r-2 border-t-2 border-primary" />
      <span className="absolute bottom-0 left-0 size-4 rounded-bl border-b-2 border-l-2 border-primary" />
      <span className="absolute bottom-0 right-0 size-4 rounded-br border-b-2 border-r-2 border-primary" />
      <div aria-hidden className="absolute inset-6 rounded-full bg-primary/15 blur-xl" />
      <Brain
        aria-hidden="true"
        className="relative size-20 text-slate-300"
        strokeWidth={1}
      />
      <span className="absolute size-2.5 rounded-full bg-primary shadow-[0_0_0_4px_rgba(124,205,179,0.25)]" />
    </div>
  );
}

/** Document/notes illustration with a check mark (Gnosis AI). */
function GnosisVisual() {
  return (
    <div className="relative hidden h-32 w-32 shrink-0 items-center justify-center sm:flex">
      <div className="w-full rounded-lg border border-border bg-surface p-4 shadow-sm">
        <div className="space-y-2.5">
          <div className="h-2 w-2/3 rounded-full bg-border" />
          <div className="h-2 w-full rounded-full bg-border" />
          <div className="h-2 w-full rounded-full bg-border" />
          <div className="h-2 w-1/2 rounded-full bg-primary/40" />
        </div>
        <div className="mt-4 flex justify-end">
          <CheckCircle2 aria-hidden="true" className="size-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

export default Solutions;
