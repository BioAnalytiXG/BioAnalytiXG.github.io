import type { Metadata } from "next";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { BetaApplicationForm } from "@/components/forms/beta-application-form";
import { absoluteUrl, routeMetadata, siteConfig } from "@/lib/site-config";

/**
 * Gnosis AI beta access page (`/beta`).
 *
 * The beta program is exclusive to Gnosis AI — our AI study companion for
 * university students — so this page is themed with the Gnosis teal palette
 * (`gnosis-theme`) and tells the Gnosis story rather than the Orasis / medical
 * one. It hosts the shared, server-first {@link BetaApplicationForm} in the
 * `#apply` section, which the navbar "Request beta access" CTA and the Gnosis
 * AI page's "Request pilot access" buttons both point to.
 *
 * Layout follows the shared cross-page template: a light page-header band
 * (overline + bold `h1` + lead), a short "what to expect" highlight row, and
 * the application form. Styling is token-only and entrances use the
 * reduced-motion-aware {@link ScrollReveal}. The Navbar and footer come from
 * the root layout.
 */

const betaMeta = routeMetadata.beta;

export const metadata: Metadata = {
  title: betaMeta.title,
  description: betaMeta.description,
  alternates: {
    canonical: absoluteUrl(betaMeta.path),
  },
  openGraph: {
    type: betaMeta.ogType,
    siteName: siteConfig.name,
    title: betaMeta.title,
    description: betaMeta.description,
    url: absoluteUrl(betaMeta.path),
    images: [
      { url: betaMeta.ogImage, width: 1200, height: 630, alt: betaMeta.title },
    ],
  },
  twitter: {
    card: betaMeta.twitterCard,
    title: betaMeta.title,
    description: betaMeta.description,
    images: [betaMeta.ogImage],
  },
};

/** Per-card stagger step (ms) for the scroll-reveal cascade. */
const STAGGER_STEP_MS = 80;

interface Highlight {
  icon: LucideIcon;
  title: string;
  description: string;
}

const HIGHLIGHTS: Highlight[] = [
  {
    icon: Sparkles,
    title: "Be first in line",
    description:
      "Get early access to Gnosis AI and help shape the product before public launch.",
  },
  {
    icon: BookOpen,
    title: "Course-grounded study",
    description:
      "Personalized study plans, quizzes, and flashcards built on your official course material.",
  },
  {
    icon: GraduationCap,
    title: "For students & universities",
    description:
      "Join as an individual learner or bring the pilot to your faculty or cohort.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-first",
    description:
      "Your data is encrypted, never sold, and used only to run your study experience.",
  },
];

export default function BetaPage() {
  return (
    <div className="gnosis-theme">
      {/* Page-header band */}
      <section className="border-b border-border bg-background py-16 md:py-24">
        <div className="container">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink">
              <GraduationCap aria-hidden="true" className="size-4" />
              Gnosis AI Beta
            </p>
            <h1 className="mt-5 text-foreground">
              Join the Gnosis AI beta
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              Gnosis AI is our AI study companion for university students —
              personalized learning grounded in your official course material.
              Request beta access to be among the first to try it, starting with
              our Anatomy pilot.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* What to expect */}
      <section
        aria-labelledby="beta-highlights-heading"
        className="bg-surface py-16 md:py-24"
      >
        <div className="container">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <h2 id="beta-highlights-heading" className="text-foreground">
              What you get in the beta
            </h2>
            <p className="mt-4 text-lg text-muted">
              A first look at Gnosis AI and a direct line to the team building it.
            </p>
          </ScrollReveal>

          <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={item.title}>
                  <ScrollReveal delay={index * STAGGER_STEP_MS} className="h-full">
                    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
                      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon aria-hidden="true" className="size-5" strokeWidth={2} />
                      </span>
                      <h3 className="mt-5 text-lg font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {item.description}
                      </p>
                    </div>
                  </ScrollReveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Application form */}
      <section
        id="apply"
        aria-labelledby="beta-apply-heading"
        className="scroll-mt-24 bg-background py-16 md:py-24"
      >
        <div className="container">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Request beta access
            </p>
            <h2 id="beta-apply-heading" className="mt-3 text-foreground">
              Tell us about yourself
            </h2>
            <p className="mt-4 text-lg text-muted">
              Share your details and what you&apos;re studying. We&apos;ll be in
              touch as soon as the next Gnosis AI beta cohort opens up.
            </p>
          </ScrollReveal>

          <ScrollReveal className="mx-auto mt-12 max-w-xl" delay={120}>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
              <BetaApplicationForm />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
