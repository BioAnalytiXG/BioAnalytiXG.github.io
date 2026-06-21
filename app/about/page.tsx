import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Brain,
  Building2,
  CheckCircle2,
  Compass,
  FlaskConical,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Newspaper,
  Rocket,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Telescope,
  type LucideIcon,
} from "lucide-react";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { routeMetadata, absoluteUrl, siteConfig } from "@/lib/site-config";

/**
 * About route (`/about`) — Requirements 1.1 (one route per page) and 1.2
 * (renders every primary content section the legacy About Us page contained).
 *
 * Rebuilt to follow the marketing reference layout: a split intro hero with a
 * vector "AI" scene, an "Our mission" band with supporting principles, the
 * "Two AI platforms. One vision." product pair, an "Our numbers" impact strip,
 * a horizontal "Built on research. Driven by people." story timeline, an
 * elevated team gallery (the legacy photos + descriptions, made far more
 * polished), and a closing conversion band. All styling is token-only — no
 * hard-coded color literals — icons come from `lucide-react`, imagery is
 * rendered through `next/image`, and entrances use the reduced-motion-aware
 * {@link ScrollReveal}. Full per-route SEO metadata is derived from the shared
 * `routeMetadata.about` config.
 */

const meta = routeMetadata.about;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: {
    canonical: absoluteUrl(meta.path),
  },
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

// ---------------------------------------------------------------------------
// Content models
// ---------------------------------------------------------------------------

/** Supporting principles shown beside the mission statement. */
interface Principle {
  icon: LucideIcon;
  title: string;
  description: string;
}

const principles: Principle[] = [
  {
    icon: FlaskConical,
    title: "Scientific rigor",
    description: "A research-first, clinically validated approach to every model we ship.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & privacy",
    description: "Built with security, data protection, and medical ethics by design.",
  },
  {
    icon: HeartHandshake,
    title: "Human impact",
    description: "Technology that empowers professionals and creates meaningful change for the people they serve.",
  },
];

/** Headline impact numbers. */
interface Stat {
  icon: LucideIcon;
  value: string;
  label: string;
}

const stats: Stat[] = [
  { icon: Award, value: "5+", label: "Awards & honors, incl. Forbes 30 Under 30" },
  { icon: Building2, value: "3", label: "Clinical & academic partners" },
  { icon: GraduationCap, value: "1", label: "University pilot underway" },
  { icon: ShieldCheck, value: "99%+", label: "Focus on data privacy & security" },
];

/** Milestones for the horizontal story timeline. */
interface Milestone {
  icon: LucideIcon;
  year: string;
  title: string;
  description: string;
}

const milestones: Milestone[] = [
  {
    icon: Sparkles,
    year: "2024",
    title: "Founded with a vision",
    description: "BioAnalytiX is born to bring trustworthy AI to healthcare and education.",
  },
  {
    icon: Award,
    year: "2024",
    title: "First awards",
    description: "Wins at Ennovation and YERAME; runner-up at InnoHealth Forum.",
  },
  {
    icon: Handshake,
    year: "2025",
    title: "Clinical partnerships",
    description: "Partners with ACTA Lab and the General Hospital of Larissa.",
  },
  {
    icon: Newspaper,
    year: "2025",
    title: "Forbes 30 Under 30",
    description: "Recognized by Forbes Greece for healthtech innovation.",
  },
  {
    icon: Rocket,
    year: "Next",
    title: "Scaling impact",
    description: "Expanding pilots and bringing Orasis AI and Gnosis AI to more people.",
  },
];

/** Team members, grouped by category, derived from the legacy About Us page. */
interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  /** Short expertise tags surfaced on the card. */
  expertise: string[];
  linkedin?: string;
}

interface TeamGroup {
  heading: string;
  description: string;
  members: TeamMember[];
}

const teamGroups: TeamGroup[] = [
  {
    heading: "Co-founders",
    description: "Medicine, AI, and engineering — under one mission.",
    members: [
      {
        name: "Christos Tsoutsas",
        role: "Co-Founder & AI Engineer",
        bio: "Digital Systems graduate specializing in artificial intelligence and machine learning. Leads the development of the AI algorithms that power our diagnostic solutions, with deep expertise in neural networks and medical imaging analysis.",
        image: "/images/team/christos-tsoutsas.jpg",
        expertise: ["Machine Learning", "Neural Networks", "Medical Imaging"],
        linkedin: "https://www.linkedin.com/in/christos-tsoutsas/",
      },
      {
        name: "Nikolas Papageorgiou",
        role: "Co-Founder & Medical Expert",
        bio: "Medical student passionate about integrating clinical expertise with innovative technology. Provides the medical insight that guides our product development, ensuring our solutions meet real-world clinical needs and the highest standards of accuracy.",
        image: "/images/team/nikolas-papageorgiou.jpg",
        expertise: ["Clinical Insight", "Medical Validation", "Radiology"],
        linkedin: "https://www.linkedin.com/in/nikolas-papageorgiou-b1ba1025b/",
      },
      {
        name: "Pantelis Tsirigotis",
        role: "Co-Founder & Software Engineer",
        bio: "Software engineer at Pfizer with extensive experience in enterprise IT systems. Oversees our software architecture and ensures the reliability, scalability, and security of our platform, bringing best practices from the pharmaceutical industry.",
        image: "/images/team/pantelis-tsirigotis.jpg",
        expertise: ["Software Architecture", "Enterprise Systems", "Security"],
        linkedin: "https://www.linkedin.com/in/pantelis-tsirigotis/",
      },
    ],
  },
  {
    heading: "Technology team",
    description: "The builders extending what our platform can do.",
    members: [
      {
        name: "Christos Leptokaropoulos",
        role: "Core Team Member",
        bio: "Talented contributor to our AI development efforts, bringing fresh perspectives and enthusiasm to our technical team.",
        image: "/images/team/christos-leptokaropoulos.jpg",
        expertise: ["AI Development", "Research"],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <MissionBand />
      <ProductsBand />
      <NumbersBand />
      <StoryTimeline />
      <TeamGallery />
      <ClosingCta />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero — split intro with a vector "AI" scene                                */
/* -------------------------------------------------------------------------- */

function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Ambient brand glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-24 h-[34rem] w-[34rem] rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="absolute -left-40 top-56 h-[26rem] w-[26rem] rounded-full bg-primary/[0.05] blur-3xl" />
      </div>

      <div className="container py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
              About BioAnalytiX
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
              AI solutions
              <br />
              with <span className="text-primary">purpose.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              BioAnalytiX is a research-driven AI company building trustworthy
              solutions for healthcare and education. Our mission is to turn
              complex medical data into clear insights that improve outcomes and
              empower the people behind every diagnosis.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                href="#story"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Our story
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="#team"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Meet the team
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120} className="min-w-0">
            <AboutHeroVisual />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Decorative hero scene: a tilted "AI" card wired to a small neural network,
 * flanked by floating document cards and accent dots. Pure CSS/SVG, so no
 * bitmap asset is required. Marked `aria-hidden` since it is purely visual.
 */
function AboutHeroVisual() {
  return (
    <div aria-hidden className="relative mx-auto aspect-[4/3] w-full max-w-xl">
      {/* Soft framing glow */}
      <div className="absolute inset-8 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-primary/5 blur-2xl" />

      {/* Orbit ring */}
      <svg
        viewBox="0 0 600 450"
        className="about-orbit absolute inset-0 h-full w-full text-primary"
        fill="none"
      >
        <ellipse
          cx="300"
          cy="225"
          rx="250"
          ry="150"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="3 9"
          opacity="0.85"
        />
      </svg>

      {/* Central AI card */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="about-float-tilt rotate-[-8deg]">
          <div className="relative rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                AI
              </span>
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
                <Sparkles className="size-4" strokeWidth={2} />
              </span>
            </div>
            {/* Mini neural-network glyph */}
            <svg viewBox="0 0 200 130" className="mt-3 h-28 w-44">
              <g
                className="about-net-lines"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                opacity="0.55"
              >
                <line x1="30" y1="35" x2="100" y2="25" />
                <line x1="30" y1="35" x2="100" y2="65" />
                <line x1="30" y1="95" x2="100" y2="65" />
                <line x1="30" y1="95" x2="100" y2="105" />
                <line x1="100" y1="25" x2="170" y2="50" />
                <line x1="100" y1="65" x2="170" y2="50" />
                <line x1="100" y1="65" x2="170" y2="90" />
                <line x1="100" y1="105" x2="170" y2="90" />
              </g>
              <g fill="hsl(var(--primary))">
                <circle className="about-node" style={{ animationDelay: "0s" }} cx="30" cy="35" r="6" />
                <circle className="about-node" style={{ animationDelay: "0.4s" }} cx="30" cy="95" r="6" />
                <circle className="about-node" style={{ animationDelay: "0.8s" }} cx="100" cy="25" r="6" />
                <circle className="about-node" style={{ animationDelay: "1.2s" }} cx="100" cy="65" r="6" />
                <circle className="about-node" style={{ animationDelay: "1.6s" }} cx="100" cy="105" r="6" />
                <circle className="about-node" style={{ animationDelay: "2s" }} cx="170" cy="50" r="6" />
                <circle className="about-node" style={{ animationDelay: "2.4s" }} cx="170" cy="90" r="6" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Floating "insight" card — top right */}
      <div className="about-float-tilt-alt absolute right-2 top-6 rounded-xl border border-border bg-card p-3 shadow-md">
        <div className="space-y-1.5">
          <div className="h-1.5 w-16 rounded-full bg-primary/40" />
          <div className="h-1.5 w-12 rounded-full bg-border" />
          <div className="h-1.5 w-14 rounded-full bg-border" />
        </div>
      </div>

      {/* Floating stat chip — bottom left */}
      <div className="about-float-y absolute bottom-8 left-2 rounded-xl border border-border bg-card px-3 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
            <ShieldCheck className="size-4" strokeWidth={2} />
          </span>
          <div>
            <div className="h-1.5 w-14 rounded-full bg-foreground/70" />
            <div className="mt-1 h-1.5 w-10 rounded-full bg-border" />
          </div>
        </div>
      </div>

      {/* Accent dots */}
      <span className="about-twinkle absolute right-16 top-1/3 size-2.5 rounded-full bg-primary shadow-[0_0_0_5px_hsl(var(--primary)/0.18)]" />
      <span
        className="about-twinkle absolute bottom-1/4 left-1/3 size-2 rounded-full bg-brand-ink/60"
        style={{ animationDelay: "1.5s" }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Mission band                                                               */
/* -------------------------------------------------------------------------- */

function MissionBand() {
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="container">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          <ScrollReveal>
            <div className="flex items-start gap-5">
              <span className="hidden size-14 shrink-0 place-items-center rounded-2xl bg-card text-brand-ink shadow-sm ring-1 ring-border sm:grid">
                <Compass className="size-7" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
                  Our mission
                </p>
                <h2 className="mt-3 text-balance text-foreground">
                  To advance human potential through AI that sees deeper, learns
                  continuously, and earns trust.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                  We build AI that makes healthcare and education more
                  efficient, accurate, and accessible — giving professionals
                  the tools to make faster, more confident decisions and
                  improving outcomes for the people who matter most.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {principles.map((principle) => {
                const Icon = principle.icon;
                return (
                  <li
                    key={principle.title}
                    className="rounded-xl border border-border bg-card p-5 shadow-sm"
                  >
                    <span className="inline-flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
                      <Icon className="size-5" strokeWidth={2} aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-foreground">
                      {principle.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {principle.description}
                    </p>
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
/* Products band — "Two AI platforms. One vision."                            */
/* -------------------------------------------------------------------------- */

function ProductsBand() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
            Our products
          </p>
          <h2 className="mt-3 text-foreground">Two AI platforms. One vision.</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Our products tackle real-world challenges across healthcare and
            education — built to deliver measurable impact wherever they're
            deployed.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Orasis AI — Healthcare */}
          <ScrollReveal className="h-full min-w-0">
            <article className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:p-8">
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Stethoscope aria-hidden="true" className="size-6" strokeWidth={1.75} />
              </span>

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
          <ScrollReveal delay={100} className="h-full min-w-0">
            <article className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:p-8">
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap aria-hidden="true" className="size-6" strokeWidth={1.75} />
              </span>

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
      </div>
    </section>
  );
}

/** Brain-scan illustration with corner "targeting" brackets (Orasis AI). */
function OrasisVisual() {
  return (
    <div className="relative hidden size-32 shrink-0 place-items-center sm:grid">
      <span className="absolute left-0 top-0 size-4 rounded-tl border-l-2 border-t-2 border-primary" />
      <span className="absolute right-0 top-0 size-4 rounded-tr border-r-2 border-t-2 border-primary" />
      <span className="absolute bottom-0 left-0 size-4 rounded-bl border-b-2 border-l-2 border-primary" />
      <span className="absolute bottom-0 right-0 size-4 rounded-br border-b-2 border-r-2 border-primary" />
      <div aria-hidden className="absolute inset-6 rounded-full bg-primary/15 blur-xl" />
      <Brain aria-hidden="true" className="relative size-20 text-slate-300" strokeWidth={1} />
      <span className="absolute size-2.5 rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.25)]" />
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

/* -------------------------------------------------------------------------- */
/* Numbers band — "Making an impact together"                                 */
/* -------------------------------------------------------------------------- */

function NumbersBand() {
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="container">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-center lg:gap-16">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
              Our numbers
            </p>
            <h2 className="mt-3 text-foreground">Making an impact together</h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
              Early traction that shows what trustworthy, research-driven AI can
              do in the real world.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label}>
                    <Icon
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
                );
              })}
            </dl>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Story timeline — "Built on research. Driven by people."                    */
/* -------------------------------------------------------------------------- */

function StoryTimeline() {
  return (
    <section id="story" className="scroll-mt-24 bg-background py-16 md:py-24">
      <div className="container">
        <ScrollReveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
            Our story
          </p>
          <h2 className="mt-3 text-foreground">
            Built on research. Driven by people.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            BioAnalytiX was founded by engineers, scientists, and healthcare
            professionals who believe AI can — and should — make a real
            difference. We pair deep technical expertise with clinical insight to
            build solutions you can trust.
          </p>
        </ScrollReveal>

        {/* Timeline */}
        <div className="relative mt-14">
          {/* Connecting line (md+) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-5 hidden h-px bg-border md:block"
          />
          <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-5 md:gap-6">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <li key={milestone.title}>
                  <ScrollReveal delay={index * 80} className="h-full">
                    <div className="flex h-full flex-col">
                      <span className="relative inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-brand-ink shadow-sm">
                        <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <span className="mt-4 text-sm font-bold tracking-[-0.01em] text-primary">
                        {milestone.year}
                      </span>
                      <h3 className="mt-1 text-base font-semibold text-foreground">
                        {milestone.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        {milestone.description}
                      </p>
                    </div>
                  </ScrollReveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Team gallery — elevated photo cards (Req 1.2: keep photos + descriptions)  */
/* -------------------------------------------------------------------------- */

/** Inline LinkedIn glyph (lucide has no brand icon for LinkedIn). */
function LinkedInGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="group flex h-full w-full max-w-xs flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      {/* Photo with gradient + name overlay */}
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <Image
          src={member.image}
          alt={`Portrait of ${member.name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {/* Readability gradient */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent"
        />
        {/* Top accent bar revealed on hover */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100"
        />
        {/* Name + role */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span
            aria-hidden
            className="block h-0.5 w-8 origin-left rounded-full bg-primary transition-all duration-300 group-hover:w-12"
          />
          <h4 className="mt-3 font-display text-xl font-bold leading-tight tracking-[-0.02em] text-white drop-shadow-sm">
            {member.name}
          </h4>
          <p className="mt-1.5 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-primary">
            {member.role}
          </p>
        </div>
        {/* LinkedIn quick-link */}
        {member.linkedin ? (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-brand-ink shadow-sm backdrop-blur transition-all hover:bg-white hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <LinkedInGlyph className="size-4" />
            <span className="sr-only">{member.name} on LinkedIn</span>
          </a>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <p className="flex-1 text-sm leading-relaxed text-muted">{member.bio}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {member.expertise.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function TeamGallery() {
  return (
    <section id="team" className="scroll-mt-24 bg-surface py-16 md:py-24">
      <div className="container">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
            Our team
          </p>
          <h2 className="mt-3 text-foreground">
            Meet the people behind BioAnalytiX
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            A diverse group of innovators united by a common goal: transforming
            healthcare and learning through technology.
          </p>
        </ScrollReveal>

        <div className="mt-14 space-y-14">
          {teamGroups.map((group) => (
            <div key={group.heading}>
              <ScrollReveal className="flex flex-col gap-1 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
                <h3 className="text-foreground">{group.heading}</h3>
                <p className="text-sm text-muted">{group.description}</p>
              </ScrollReveal>

              <ul className="mt-8 grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {group.members.map((member, index) => (
                  <li key={member.name} className="w-full">
                    <ScrollReveal delay={index * 90} className="flex h-full justify-center">
                      <TeamCard member={member} />
                    </ScrollReveal>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Closing CTA — "The future is intelligent — and human."                     */
/* -------------------------------------------------------------------------- */

function ClosingCta() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <ScrollReveal>
          <div className="flex flex-col items-start gap-6 rounded-2xl border border-border bg-surface p-8 shadow-sm md:flex-row md:items-center md:justify-between md:p-10">
            <div className="flex items-start gap-4">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                <Telescope className="size-6" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-3xl">
                  The future is intelligent — and human.
                </h2>
                <p className="mt-2 max-w-xl text-base leading-relaxed text-muted">
                  We partner with institutions, educators, and innovators who
                  want to help shape what comes next.
                </p>
              </div>
            </div>

            <Link
              href="/#contact"
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:w-auto"
            >
              Partner with us
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
