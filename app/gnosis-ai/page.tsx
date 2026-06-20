import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  GraduationCap,
  BookOpen,
  UserRound,
  ShieldCheck,
  Building2,
  TrendingUp,
  MessageCircle,
  LayoutDashboard,
  ListChecks,
  Layers,
  FileText,
  type LucideIcon,
} from "lucide-react";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { GnosisDashboardPreview } from "@/components/gnosis-dashboard-preview";
import { GnosisAvatar } from "@/components/gnosis-avatar";
import { NosiChatDemo } from "@/components/nosi-chat-demo";
import { FlashcardsDemo } from "@/components/flashcards-demo";
import { DashboardMiniDemo } from "@/components/dashboard-mini-demo";
import { QuizDemo } from "@/components/quiz-demo";
import { OrbitingCircleIcons } from "@/components/orbiting-circles";
import { GnosisStepsBeam } from "@/components/gnosis-steps-beam";
import { VideoModalButton } from "@/components/video-modal-button";
import { routeMetadata, absoluteUrl, siteConfig } from "@/lib/site-config";

/**
 * Gnosis AI product page (`/gnosis-ai`).
 *
 * Mirrors the home-page visual language (split hero, soft ambient glows, token
 * colors, `ScrollReveal` entrances, bento-style cards) while telling the Gnosis
 * AI education story: an AI study companion for university students built on
 * official course material. All styling is token-only (no color literals) and
 * the device mock is a lightweight CSS/HTML render of the app dashboard, so the
 * page needs no bitmap screenshot asset.
 */

const meta = routeMetadata.gnosis;

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

const PILOT_HREF = "/beta";

export default function GnosisAiPage() {
  return (
    <main className="gnosis-theme">
      <GnosisHero />
      <ValueRow />
      <HowItWorks />
      <CapabilityCards />
      <BuiltOnBand />
      <PilotCta />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

function GnosisHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft ambient background glows (matches the home hero) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-24 h-[36rem] w-[36rem] rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="absolute -left-40 top-48 h-[28rem] w-[28rem] rounded-full bg-primary/[0.05] blur-3xl" />
      </div>

      <div className="container py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy column */}
          <ScrollReveal className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-ink">
              <GraduationCap aria-hidden="true" className="size-4" />
              Education AI platform
            </span>

            <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
              AI learning companion for{" "}
              <span className="text-primary">your university courses</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Personalized study plans, grounded explanations, smart quizzes,
              flashcards, and weak-area practice — all based on your official
              course material. Starting with our Anatomy pilot.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                href={PILOT_HREF}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Request pilot access
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <VideoModalButton
                src="/images/GnosisAI-ProductReveal.mp4"
                label="See how it works"
                title="Gnosis AI product reveal"
                className="w-full justify-center sm:w-auto"
              />
            </div>
          </ScrollReveal>

          {/* Visual column */}
          <ScrollReveal delay={120} className="min-w-0">
            <GnosisDashboardPreview />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Value row (five quick highlights)                                          */
/* -------------------------------------------------------------------------- */

interface ValueItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const VALUE_ITEMS: ValueItem[] = [
  {
    icon: BookOpen,
    title: "Grounded in official material",
    description: "Built on Anatomy 1 textbooks, slides, and past test examples.",
  },
  {
    icon: UserRound,
    title: "Personalized for you",
    description: "Study plans adapt to your strengths, goals, and schedule.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-first",
    description: "Your data is encrypted and never shared.",
  },
  {
    icon: Building2,
    title: "Built for universities",
    description: "Aligned with curricula and assessment standards.",
  },
  {
    icon: TrendingUp,
    title: "Measurable progress",
    description: "Track mastery and improvement with clear analytics.",
  },
];

function ValueRow() {
  return (
    <section className="border-y border-border bg-background py-16 md:py-24">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Orbiting value icons around the Gnosis AI mark */}
          <ScrollReveal className="min-w-0">
            <div
              aria-hidden="true"
              className="relative mx-auto flex aspect-square w-full max-w-sm scale-[0.72] items-center justify-center sm:scale-100"
            >
              {/* Center mark */}
              <div className="z-10 inline-flex size-20 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                <img
                  src="/images/gnosis-logo.png"
                  alt=""
                  className="h-10 w-auto"
                />
              </div>

              {/* Outer ring: the five value icons */}
              <OrbitingCircleIcons radius={150} iconSize={52} duration={28}>
                {VALUE_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <span
                      key={item.title}
                      className="inline-flex size-12 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm"
                    >
                      <Icon className="size-5" strokeWidth={1.75} />
                    </span>
                  );
                })}
              </OrbitingCircleIcons>

              {/* Inner ring: small decorative nodes */}
              <OrbitingCircleIcons
                radius={84}
                iconSize={16}
                reverse
                speed={1.4}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-flex size-2.5 rounded-full bg-brand-soft ring-1 ring-primary/30"
                  />
                ))}
              </OrbitingCircleIcons>
            </div>
          </ScrollReveal>

          {/* Value items */}
          <ScrollReveal delay={120} className="min-w-0">
            <ul className="space-y-6">
              {VALUE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex gap-4">
                    <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                      <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {item.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* How it works (four steps)                                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* How it works (animated beam flow)                                          */
/* -------------------------------------------------------------------------- */

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface py-16 md:py-24">
      <div className="container">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
            How it works
          </p>
          <h2 className="mt-3 text-foreground">Learn smarter in 4 simple steps</h2>
        </ScrollReveal>

        <ScrollReveal delay={120} className="mt-14">
          <GnosisStepsBeam />
        </ScrollReveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Capability cards (four feature cards with mini mocks)                      */
/* -------------------------------------------------------------------------- */

interface Capability {
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  mock: React.ReactNode;
  /** Optional custom header element (e.g. the Nosi avatar) replacing the icon tile. */
  headerNode?: React.ReactNode;
}

const CAPABILITIES: Capability[] = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Your study hub. See what's next and track your progress.",
    cta: "Explore dashboard",
    mock: <DashboardMiniDemo />,
  },
  {
    icon: MessageCircle,
    title: "AI Tutor (Nosi)",
    description: "Get instant, accurate answers with step-by-step explanations.",
    cta: "Chat with Nosi",
    headerNode: <GnosisAvatar size={44} state="idle" />,
    mock: <NosiChatDemo />,
  },
  {
    icon: ListChecks,
    title: "Smart Quizzes",
    description: "Adaptive quizzes that focus on what you need most.",
    cta: "Try a quiz",
    mock: <QuizDemo />,
  },
  {
    icon: Layers,
    title: "Flashcards & Weak Areas",
    description: "Spaced-repetition flashcards and targeted practice.",
    cta: "Open flashcards",
    mock: <FlashcardsDemo />,
  },
];

function CapabilityCards() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((cap, index) => {
            const Icon = cap.icon;
            return (
              <ScrollReveal key={cap.title} delay={index * 80} className="h-full">
                <article className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  {cap.headerNode ?? (
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon aria-hidden="true" className="size-5" strokeWidth={2} />
                    </span>
                  )}
                  <h3 className="mt-5 text-lg font-semibold text-foreground">
                    {cap.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {cap.description}
                  </p>
                  <div className="mt-4">{cap.mock}</div>
                  <Link
                    href={PILOT_HREF}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink transition-colors hover:text-brand-ink/80"
                  >
                    {cap.cta}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
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
/* "Built on official Anatomy 1 material" band                                */
/* -------------------------------------------------------------------------- */

const INSTITUTIONS: {
  university: string;
  /** Optional logo in /public. Falls back to the Building2 icon when omitted. */
  universityLogo?: string;
  department: string;
  /** Optional logo in /public. Falls back to the GraduationCap icon when omitted. */
  departmentLogo?: string;
  modules: { label: string; active?: boolean }[];
}[] = [
  {
    university: "University of Thessaly",
    universityLogo: "/images/universities/anatomy_lab_logo_EN.png",
    department: "Medical School",
    modules: [{ label: "Anatomia 1", active: true }],
  },
];

const SOURCES: { icon: LucideIcon; label: string }[] = [
  { icon: BookOpen, label: "Textbooks" },
  { icon: FileText, label: "Lecture slides" },
  { icon: ListChecks, label: "Past test examples" },
];

function BuiltOnBand() {
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="container">
        {/* Intro */}
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-ink/15 bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-ink">
              <ShieldCheck aria-hidden="true" className="size-3.5" strokeWidth={2} />
              Official course material
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">
              Built on your faculty&apos;s official material
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              Gnosis AI is trained exclusively on each course&apos;s approved
              resources — so every answer stays accurate, relevant, and aligned
              to what your faculty actually teaches.
            </p>
          </div>
        </ScrollReveal>

        {/* Institution showcase cards */}
        <div
          className={`mx-auto mt-12 grid grid-cols-1 gap-6 ${
            INSTITUTIONS.length === 1 ? "max-w-xl" : "max-w-4xl md:grid-cols-2"
          }`}
        >
          {INSTITUTIONS.map((inst, index) => (
            <ScrollReveal key={inst.university} delay={index * 80} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                {/* Logo zone */}
                <div className="relative flex h-56 items-center justify-center border-b border-border bg-gradient-to-b from-brand-soft/60 to-card sm:h-64">
                  {inst.universityLogo ? (
                    <Image
                      src={inst.universityLogo}
                      alt={`${inst.university} logo`}
                      fill
                      sizes="(max-width: 768px) 90vw, 560px"
                      className="object-contain p-6"
                    />
                  ) : (
                    <span className="inline-flex size-24 items-center justify-center rounded-2xl border border-border bg-surface text-brand-ink">
                      <Building2 aria-hidden="true" className="size-11" strokeWidth={1.5} />
                    </span>
                  )}
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/80 px-2 py-0.5 text-[0.65rem] font-semibold text-brand-ink ring-1 ring-border backdrop-blur">
                    <ShieldCheck aria-hidden="true" className="size-3" strokeWidth={2} />
                    Official
                  </span>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold leading-snug tracking-[-0.01em] text-foreground">
                    {inst.university}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    {inst.departmentLogo ? (
                      <span className="relative inline-block size-4 shrink-0 overflow-hidden">
                        <Image
                          src={inst.departmentLogo}
                          alt={`${inst.department} logo`}
                          fill
                          sizes="16px"
                          className="object-contain"
                        />
                      </span>
                    ) : (
                      <GraduationCap aria-hidden="true" className="size-4 shrink-0 text-primary" strokeWidth={1.75} />
                    )}
                    <span className="text-sm font-medium text-muted">
                      {inst.department}
                    </span>
                  </div>

                  <div className="mt-5 border-t border-border pt-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
                      Supported modules
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {inst.modules.map((mod) => (
                        <li
                          key={mod.label}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-brand-ink"
                        >
                          <BookOpen aria-hidden="true" className="size-3.5" strokeWidth={2} />
                          {mod.label}
                          {mod.active && (
                            <span className="size-1.5 rounded-full bg-primary" aria-label="Live" />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

        {/* Grounded-in sources strip */}
        <ScrollReveal>
          <div className="mx-auto mt-8 flex max-w-4xl flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-6 text-center sm:flex-row sm:gap-6">
            <p className="text-sm font-semibold text-foreground">
              Every answer is grounded in
            </p>
            <ul className="flex flex-wrap items-center justify-center gap-2">
              {SOURCES.map((source) => {
                const Icon = source.icon;
                return (
                  <li
                    key={source.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground"
                  >
                    <Icon aria-hidden="true" className="size-3.5 text-primary" strokeWidth={2} />
                    {source.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </ScrollReveal>

        <p className="mx-auto mt-6 max-w-4xl text-center text-xs leading-relaxed text-muted">
          More modules and faculties are being added.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Closing CTA                                                                */
/* -------------------------------------------------------------------------- */

function PilotCta() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <ScrollReveal>
          <div className="rounded-xl bg-primary px-6 py-16 text-center shadow-md md:px-16 md:py-20">
            <h2 className="mx-auto max-w-3xl text-balance text-primary-foreground">
              Bring Gnosis AI to your university
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
              Request pilot access for your faculty or cohort and help shape the
              future of AI-assisted learning.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href={PILOT_HREF}
                className="inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Request pilot access
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
