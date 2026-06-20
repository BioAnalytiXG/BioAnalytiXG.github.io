import type { Metadata } from "next";
import {
  Handshake,
  Database,
  Stethoscope,
  ShieldCheck,
  Building2,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { BetaApplicationForm } from "@/components/forms/beta-application-form";
import { absoluteUrl, routeMetadata, siteConfig } from "@/lib/site-config";

/**
 * Orasis AI clinical-data partnership page (`/data-partner`).
 *
 * Orasis AI is still in MVP development, so we can't run a clinical pilot yet.
 * Instead, this page invites hospitals and radiology departments to collaborate
 * by contributing anonymized non-contrast head-CT data and clinical expertise
 * that help us build and validate the models — with data partners first in line
 * for the pilot once the software is ready.
 *
 * It mirrors the shared cross-page template (light header band, a short
 * highlight row, then the application form) and reuses the server-first
 * {@link BetaApplicationForm} in the `#apply` section, which the Orasis AI
 * "Become a data partner" CTAs point to. Themed with the Orasis palette
 * (`orasis-theme`). The navbar and footer come from the root layout.
 */

const meta = routeMetadata.dataPartner;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: absoluteUrl(meta.path) },
  openGraph: {
    type: meta.ogType,
    siteName: siteConfig.name,
    title: meta.title,
    description: meta.description,
    url: absoluteUrl(meta.path),
    images: [{ url: meta.ogImage, width: 1200, height: 630, alt: meta.title }],
  },
  twitter: {
    card: meta.twitterCard,
    title: meta.title,
    description: meta.description,
    images: [meta.ogImage],
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
    icon: Stethoscope,
    title: "Co-development",
    description:
      "Shape the features, findings, and reporting so Orasis AI fits how your radiologists read.",
  },
  {
    icon: Database,
    title: "Real-world validation",
    description:
      "Strengthen accuracy by validating Orasis AI on de-identified head CT from your institution.",
  },
  {
    icon: FlaskConical,
    title: "Priority pilot access",
    description:
      "Partners are first to deploy Orasis AI in clinical practice once it's ready.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & compliant",
    description:
      "Data is de-identified and processed to strict privacy and regulatory standards.",
  },
];

export default function DataPartnerPage() {
  return (
    <div className="orasis-theme">
      {/* Page-header band */}
      <section className="border-b border-border bg-background py-16 md:py-24">
        <div className="container">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink">
              <Handshake aria-hidden="true" className="size-4" />
              Clinical research collaboration
            </p>
            <h1 className="mt-5 text-foreground">
              Building clinically validated brain CT AI, together
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              BioAnalytiX collaborates with hospitals and radiology departments to
              develop and validate Orasis AI on real-world non-contrast head CT.
              Partners help define the product, contribute to the research, and
              gain priority access to the clinical pilot.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted">
              <Building2 aria-hidden="true" className="size-4 text-brand-ink" />
              Already collaborating with the General Hospital of Larissa
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* What a partnership looks like */}
      <section
        aria-labelledby="partner-highlights-heading"
        className="bg-surface py-16 md:py-24"
      >
        <div className="container">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <h2 id="partner-highlights-heading" className="text-foreground">
              What a partnership looks like
            </h2>
            <p className="mt-4 text-lg text-muted">
              A research-grade collaboration with shared goals, clinical insight,
              and a direct line to the team building Orasis AI.
            </p>
          </ScrollReveal>

          <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={item.title}>
                  <ScrollReveal delay={index * STAGGER_STEP_MS} className="h-full">
                    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
                      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
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

      {/* Contact form */}
      <section
        id="apply"
        aria-labelledby="partner-apply-heading"
        className="scroll-mt-24 bg-background py-16 md:py-24"
      >
        <div className="container">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink">
              Partner with us
            </p>
            <h2 id="partner-apply-heading" className="mt-3 text-foreground">
              Let&apos;s talk
            </h2>
            <p className="mt-4 text-lg text-muted">
              Tell us about your institution and our team will follow up to scope
              a collaboration that fits your department.
            </p>
          </ScrollReveal>

          <ScrollReveal className="mx-auto mt-12 max-w-xl" delay={120}>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
              <BetaApplicationForm
                submitLabel="Start the conversation"
                pendingLabel="Sending…"
                successTitle="Message sent"
                successMessage="Thanks for reaching out — our team will follow up to explore a collaboration."
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
