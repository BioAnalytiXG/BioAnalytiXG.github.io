import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  ScanSearch,
  ShieldCheck,
  Gauge,
  ClipboardList,
  Brain,
  Lock,
  Workflow,
  ListChecks,
  Activity,
  Ruler,
  FileText,
  Network,
  ChevronRight,
  Building2,
  Wrench,
  FlaskConical,
  Construction,
  type LucideIcon,
} from "lucide-react";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { OrasisDashboardPreview } from "@/components/orasis-dashboard-preview";
import { OrasisProcessFlow } from "@/components/orasis-process-flow";
import {
  TriageDemo,
  HemorrhageDemo,
  MassEffectDemo,
  ReportDemo,
} from "@/components/orasis-capability-demos";
import { routeMetadata, absoluteUrl, siteConfig } from "@/lib/site-config";

/**
 * Orasis AI product page (`/product`).
 *
 * Mirrors the home / Gnosis AI visual language (split hero, soft ambient glows,
 * token colors, `ScrollReveal` entrances, bento-style cards) while telling the
 * Orasis AI radiology story: AI-assisted triage, detection, and structured
 * reporting for non-contrast head CT. All styling is token-only (scoped to the
 * `.orasis-theme` palette) and the device mock is a lightweight CSS/HTML render
 * of the reading workspace, so the page needs no bitmap screenshot asset.
 */

const meta = routeMetadata.product;

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

/** Data-partner CTAs route to the dedicated clinical-data collaboration page. */
const COLLAB_HREF = "/data-partner";

export default function ProductPage() {
  return (
    <main className="orasis-theme">
      <DevelopmentNotice />
      <OrasisHero />
      <ValueRow />
      <HowItWorks />
      <CapabilityCards />
      <StatusBand />
      <BuiltForBand />
      <ClosingCta />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Development status notice                                                  */
/* -------------------------------------------------------------------------- */

function DevelopmentNotice() {
  return (
    <div className="border-b border-border bg-brand-soft">
      <div className="container flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2.5 text-center text-xs font-medium text-brand-ink">
        <Construction aria-hidden="true" className="size-4 shrink-0" />
        <span>
          <strong className="font-semibold">OrasisAI is in active MVP development.</strong>{" "}
          Features shown are in progress and not yet available for clinical use.
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

function OrasisHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft ambient background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-24 h-[36rem] w-[36rem] rounded-full bg-brand-ink/[0.07] blur-3xl" />
        <div className="absolute -left-40 top-48 h-[28rem] w-[28rem] rounded-full bg-brand-ink/[0.05] blur-3xl" />
      </div>

      <div className="container py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy column */}
          <ScrollReveal className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-ink">
                <Activity aria-hidden="true" className="size-4" />
                Radiology AI platform
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-semibold text-foreground">
                <Wrench aria-hidden="true" className="size-3.5 text-warning" />
                MVP · In development
              </span>
            </div>

            <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
              OrasisAI — AI support for{" "}
              <span className="text-brand-ink">brain CT</span> review
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              AI-assisted triage, detection, and reporting for non-contrast head
              CT. Fast insights. Clear findings. Currently in MVP development with
              the General Hospital of Larissa.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                href={COLLAB_HREF}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Partner with us
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-brand-ink/40 hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                See how it works
                <Play aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted">
              <Building2 aria-hidden="true" className="size-4 text-brand-ink" />
              In collaboration with the General Hospital of Larissa
            </p>
          </ScrollReveal>

          {/* Visual column */}
          <ScrollReveal delay={120} className="min-w-0">
            <OrasisDashboardPreview />
            <p className="mt-4 text-center text-xs text-muted">
              Concept preview — interface in active development. Not for clinical use.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Value row (six quick highlights)                                           */
/* -------------------------------------------------------------------------- */

interface ValueItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const VALUE_ITEMS: ValueItem[] = [
  {
    icon: ShieldCheck,
    title: "Clinically guided",
    description: "Built and tested with radiologists at our partner hospital.",
  },
  {
    icon: Gauge,
    title: "Faster triage",
    description: "Designed to prioritize critical cases and cut turnaround time.",
  },
  {
    icon: ClipboardList,
    title: "Structured reports",
    description: "Consistent, standardized findings and impressions.",
  },
  {
    icon: Brain,
    title: "Explainable AI",
    description: "Visual heatmaps and rationale for every suggestion.",
  },
  {
    icon: Lock,
    title: "Privacy-first",
    description: "Your data is encrypted and never shared.",
  },
  {
    icon: Workflow,
    title: "Workflow-ready",
    description: "Seamless integration with PACS & RIS.",
  },
];

function ValueRow() {
  return (
    <section className="border-y border-border bg-background py-14 md:py-16">
      <div className="container">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {VALUE_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <ScrollReveal
                key={item.title}
                delay={index * 70}
                className="flex flex-col items-center text-center"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm">
                  <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  {item.description}
                </p>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* How it works (animated beam flow)                                          */
/* -------------------------------------------------------------------------- */

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-surface py-16 md:py-24">
      <div className="container">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
            How it works
          </p>
          <h2 className="mt-3 text-foreground">
            AI-powered support in 4 simple steps
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={120} className="mt-14">
          <OrasisProcessFlow />
        </ScrollReveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Capability cards (four feature cards with mini mocks)                      */
/* -------------------------------------------------------------------------- */

function CapabilityCards() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <CapabilityCard
            icon={ListChecks}
            title="Triage & prioritization"
            description="Automatically flag high-risk cases to focus on what matters most."
            cta="Open triage queue"
            mock={<TriageDemo />}
          />
          <CapabilityCard
            icon={Brain}
            title="Hemorrhage detection"
            description="Detect and localize acute hemorrhage with high sensitivity."
            cta="View example"
            mock={<HemorrhageDemo />}
          />
          <CapabilityCard
            icon={Ruler}
            title="Mass effect & shift"
            description="Assess mass effect, edema, and midline shift."
            cta="See details"
            mock={<MassEffectDemo />}
          />
          <CapabilityCard
            icon={FileText}
            title="Structured reporting"
            description="Auto-generate consistent reports aligned with best practices."
            cta="View sample report"
            mock={<ReportDemo />}
          />
        </div>
      </div>
    </section>
  );
}

function CapabilityCard({
  icon: Icon,
  title,
  description,
  cta,
  mock,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  mock: React.ReactNode;
}) {
  return (
    <ScrollReveal className="h-full">
      <article className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-ink/40 hover:shadow-md">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
          <Icon aria-hidden="true" className="size-5" strokeWidth={2} />
        </span>
        <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-4">{mock}</div>
        <Link
          href={COLLAB_HREF}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink transition-colors hover:text-brand-ink/80"
        >
          {cta}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </article>
    </ScrollReveal>
  );
}

/* -------------------------------------------------------------------------- */
/* Development / collaboration status band                                    */
/* -------------------------------------------------------------------------- */

const STATUS_CARDS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: FlaskConical,
    title: "MVP phase",
    description:
      "We're building and refining the core OrasisAI experience with an initial set of head-CT capabilities.",
  },
  {
    icon: Building2,
    title: "Clinical collaboration",
    description:
      "Developed hand-in-hand with the General Hospital of Larissa and its radiology team.",
  },
  {
    icon: Wrench,
    title: "Under active development",
    description:
      "The platform is evolving continuously and is not yet available for clinical use.",
  },
];

function StatusBand() {
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="container">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-ink">
            <Construction aria-hidden="true" className="size-3.5" strokeWidth={2} />
            Current status
          </span>
          <h2 className="mt-5 text-foreground">
            OrasisAI is in active MVP development
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            We&apos;re building OrasisAI in close collaboration with the General
            Hospital of Larissa, validating each feature with practicing
            radiologists in real clinical workflows. The entire platform is under
            active development — everything shown here is a work in progress and
            not yet cleared for clinical use.
          </p>
        </ScrollReveal>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {STATUS_CARDS.map((card, index) => {
            const Icon = card.icon;
            return (
              <ScrollReveal key={card.title} delay={index * 80} className="h-full">
                <article className="flex h-full flex-col rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                  <span className="mx-auto inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                    <Icon aria-hidden="true" className="size-5" strokeWidth={1.85} />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {card.description}
                  </p>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Built for radiology teams band                                            */
/* -------------------------------------------------------------------------- */

const TEAM_FEATURES: { icon: LucideIcon; label: string }[] = [
  { icon: Network, label: "PACS & RIS integration" },
  { icon: ScanSearch, label: "Non-contrast head CT focus" },
  { icon: ClipboardList, label: "Structured reports" },
  { icon: ShieldCheck, label: "Security & compliance" },
];

function BuiltForBand() {
  return (
    <section className="bg-background pb-4">
      <div className="container">
        <ScrollReveal>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="grid items-center gap-8 p-8 md:grid-cols-[0.9fr_1.1fr] md:p-10">
              {/* Copy + illustration */}
              <div className="flex items-center gap-6">
                <TeamIllustration />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
                    Built for radiology teams
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Designed to integrate into real-world hospital workflows.
                    Optimized for non-contrast head CT interpretation and
                    structured radiology reporting.
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[0.7rem] font-semibold text-brand-ink">
                    <Building2 aria-hidden="true" className="size-3.5" strokeWidth={2} />
                    In collaboration with the General Hospital of Larissa
                  </p>
                </div>
              </div>

              {/* Feature tiles */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TEAM_FEATURES.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.label}
                      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center shadow-sm"
                    >
                      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
                        <Icon aria-hidden="true" className="size-[1.05rem]" strokeWidth={1.85} />
                      </span>
                      <span className="text-[0.7rem] font-semibold leading-tight text-foreground">
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/** Small decorative hospital + orbit illustration (token-colored inline SVG). */
function TeamIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      className="hidden size-24 shrink-0 sm:block"
      fill="none"
    >
      {/* Orbit rings */}
      <ellipse
        cx="60"
        cy="62"
        rx="54"
        ry="26"
        stroke="hsl(var(--brand-ink) / 0.25)"
        strokeWidth="1.5"
      />
      <circle cx="14" cy="55" r="4" fill="hsl(var(--brand-ink) / 0.5)" />
      <circle cx="106" cy="70" r="3" fill="hsl(var(--brand-ink) / 0.35)" />
      {/* Hospital building */}
      <rect
        x="38"
        y="34"
        width="44"
        height="56"
        rx="4"
        fill="hsl(var(--brand-soft))"
        stroke="hsl(var(--brand-ink) / 0.5)"
        strokeWidth="2"
      />
      {/* Cross */}
      <rect x="56" y="44" width="8" height="20" rx="1.5" fill="hsl(var(--brand-ink))" />
      <rect x="50" y="50" width="20" height="8" rx="1.5" fill="hsl(var(--brand-ink))" />
      {/* Windows */}
      <rect x="45" y="70" width="9" height="9" rx="1.5" fill="hsl(var(--brand-ink) / 0.4)" />
      <rect x="66" y="70" width="9" height="9" rx="1.5" fill="hsl(var(--brand-ink) / 0.4)" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Closing CTA                                                                */
/* -------------------------------------------------------------------------- */

function ClosingCta() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-14 text-center shadow-sm md:px-16">
            {/* Faint decorative orbits */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-70">
              <svg viewBox="0 0 400 240" className="absolute -left-10 top-1/2 hidden h-40 -translate-y-1/2 lg:block" fill="none">
                <ellipse cx="120" cy="120" rx="115" ry="58" stroke="hsl(var(--brand-ink) / 0.18)" strokeWidth="1.5" />
                <circle cx="8" cy="100" r="6" fill="hsl(var(--brand-ink) / 0.3)" />
              </svg>
              <svg viewBox="0 0 200 200" className="absolute right-6 top-1/2 hidden h-32 -translate-y-1/2 text-brand-ink/25 lg:block" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M100 20c-26 0-46 18-46 44 0 14 6 22 6 34 0 14-4 18-4 30 0 18 18 32 44 32s44-14 44-32c0-12-4-16-4-30 0-12 6-20 6-34 0-26-20-44-46-44Z" />
                <path d="M100 36v110M76 64h48M72 92h56M76 120h48" strokeLinecap="round" />
              </svg>
            </div>

            <Brain aria-hidden="true" className="mx-auto size-9 text-brand-ink" strokeWidth={1.75} />
            <h2 className="mx-auto mt-4 max-w-2xl text-balance text-foreground">
              Advancing brain CT care with OrasisAI
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
              Support faster decisions. Improve confidence. Enhance patient care.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
              We collaborate with radiology teams to develop and validate OrasisAI,
              with partners first in line for the clinical pilot.
            </p>
            <div className="mt-9 flex justify-center">
              <Link
                href={COLLAB_HREF}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Partner with us
                <ChevronRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
