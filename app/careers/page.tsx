import type { Metadata } from "next";
import Link from "next/link";
import {
  Rocket,
  HeartPulse,
  Users,
  GraduationCap,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { BetaApplicationForm } from "@/components/forms/beta-application-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { absoluteUrl, routeMetadata, siteConfig } from "@/lib/site-config";

/**
 * Careers page (Requirements 1.1, 1.2).
 *
 * Provides the single Careers route in the App Router (Requirement 1.1) and
 * preserves the legacy careers content (Requirement 1.2): the "why BioAnalytiX"
 * values, the future hiring process, and the talent-pool / beta application
 * form. The form is the rebuilt server-first {@link BetaApplicationForm}
 * embedded in the `#apply` section.
 *
 * Layout follows the shared cross-page template from the Visual Design
 * Language: a light page-header band (overline + bold `h1` + `lead`), token-only
 * styling (no color/spacing literals), the `max-w-7xl` `container`, the
 * `py-16 md:py-24` section rhythm, lucide iconography, and reduced-motion-aware
 * {@link ScrollReveal} entrances. The Navbar and footer come from the root
 * layout.
 */

const careersMeta = routeMetadata.careers;

/**
 * Page-scoped SEO metadata derived from the shared route config. The site-wide
 * title template ("%s | BioAnalytiX") is applied by the root layout; canonical,
 * Open Graph, and Twitter resolve against the layout's `metadataBase`
 * (Requirement 8.1).
 */
export const metadata: Metadata = {
  title: careersMeta.title,
  description: careersMeta.description,
  alternates: {
    canonical: absoluteUrl(careersMeta.path),
  },
  openGraph: {
    type: careersMeta.ogType,
    siteName: siteConfig.name,
    title: careersMeta.title,
    description: careersMeta.description,
    url: absoluteUrl(careersMeta.path),
    images: [
      { url: careersMeta.ogImage, width: 1200, height: 630, alt: careersMeta.title },
    ],
  },
  twitter: {
    card: careersMeta.twitterCard,
    title: careersMeta.title,
    description: careersMeta.description,
    images: [careersMeta.ogImage],
  },
};

/** Why-BioAnalytiX value cards, preserving the legacy careers copy. */
interface ValueCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

const VALUES: ValueCard[] = [
  {
    icon: Rocket,
    title: "Cutting-edge technology",
    description:
      "Work with the latest AI/ML technologies and contribute to groundbreaking innovations across healthcare and education.",
  },
  {
    icon: HeartPulse,
    title: "Meaningful impact",
    description:
      "Your work directly improves outcomes for patients, clinicians, and learners around the world.",
  },
  {
    icon: Users,
    title: "Diverse team",
    description:
      "Collaborate with talented professionals from medical, education, technology, and research backgrounds.",
  },
  {
    icon: GraduationCap,
    title: "Continuous learning",
    description:
      "Access conferences, courses, and mentorship to keep advancing your career.",
  },
];

/** Future hiring process steps, preserving the legacy careers copy. */
interface ProcessStep {
  title: string;
  description: string;
}

const PROCESS: ProcessStep[] = [
  {
    title: "Talent pool review",
    description: "We review every talent-pool application first.",
  },
  {
    title: "Initial contact",
    description: "We reach out when a relevant position opens.",
  },
  {
    title: "Technical interview",
    description: "Meet the team and showcase your skills.",
  },
  {
    title: "Final interview",
    description: "Discuss vision and culture fit with leadership.",
  },
  {
    title: "Offer",
    description: "Join us as a team member.",
  },
];

/** Per-card stagger step (ms) for the scroll-reveal cascade. */
const STAGGER_STEP_MS = 80;

export default function CareersPage() {
  return (
    <>
      {/* Page-header band */}
      <section className="border-b border-border bg-background py-16 md:py-24">
        <div className="container">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Careers
            </p>
            <h1 className="mt-4 text-foreground">
              Shape the future of AI
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              We&apos;re a mission-driven team transforming healthcare and
              education with AI. Join our talent pool to be the first to hear
              when we start hiring.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Why BioAnalytiX — values */}
      <section
        aria-labelledby="values-heading"
        className="bg-background py-16 md:py-24"
      >
        <div className="container">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Why BioAnalytiX
            </p>
            <h2
              id="values-heading"
              className="mt-3 text-foreground"
            >
              A mission worth building a career on
            </h2>
            <p className="mt-4 text-lg text-muted">
              Join a team that pairs deep domain expertise with engineering
              rigor to bring trustworthy AI to healthcare and education.
            </p>
          </ScrollReveal>

          <ul className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, index) => {
              const Icon = value.icon;
              return (
                <li key={value.title}>
                  <ScrollReveal delay={index * STAGGER_STEP_MS} className="h-full">
                    <div className="group flex h-full flex-col rounded-lg border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon
                          className="h-6 w-6"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </span>
                      <h3 className="mt-6 font-display text-xl font-semibold tracking-[-0.01em] text-foreground">
                        {value.title}
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-muted">
                        {value.description}
                      </p>
                    </div>
                  </ScrollReveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Future hiring process */}
      <section
        aria-labelledby="process-heading"
        className="bg-surface py-16 md:py-24"
      >
        <div className="container">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              How hiring will work
            </p>
            <h2 id="process-heading" className="mt-3 text-foreground">
              Our future hiring process
            </h2>
            <p className="mt-4 text-lg text-muted">
              We&apos;re still in the early stages of building the company. Here&apos;s
              what to expect when we begin recruiting.
            </p>
          </ScrollReveal>

          <ol className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROCESS.map((step, index) => (
              <li key={step.title}>
                <ScrollReveal delay={index * STAGGER_STEP_MS} className="h-full">
                  <div className="flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 font-display text-lg font-semibold text-primary"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <h3 className="mt-5 font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-muted">
                      {step.description}
                    </p>
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Application / beta form */}
      <section
        id="apply"
        aria-labelledby="apply-heading"
        className="scroll-mt-24 bg-background py-16 md:py-24"
      >
        <div className="container">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Join the talent pool
            </p>
            <h2 id="apply-heading" className="mt-3 text-foreground">
              Tell us about yourself
            </h2>
            <p className="mt-4 text-lg text-muted">
              Share your details and what excites you about the future of AI.
              We&apos;ll be in touch as soon as a relevant role opens up.
            </p>
          </ScrollReveal>

          <ScrollReveal className="mx-auto mt-12 max-w-xl" delay={120}>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
              <BetaApplicationForm source="careers" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Closing CTA band */}
      <section className="py-16 md:py-24">
        <div className="container">
          <ScrollReveal>
            <div className="rounded-xl bg-primary px-6 py-16 text-center shadow-md md:px-16 md:py-20">
              <h2 className="mx-auto max-w-3xl text-balance text-primary-foreground">
                Be part of something revolutionary
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
                Your expertise could help bring AI-powered tools to clinicians,
                students, and learners everywhere. Have a question before
                applying? We&apos;d love to hear from you.
              </p>

              <div className="mt-10 flex justify-center">
                <Link
                  href="/#contact"
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "lg" }),
                  )}
                >
                  Get in touch
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
