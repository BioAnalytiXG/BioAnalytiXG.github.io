import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  ChevronRight,
  FlaskConical,
  Megaphone,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { PressHeroIllustration } from "@/components/press-hero-illustration";
import { Marquee } from "@/components/shadcn-space/animations/marquee";
import { articleImage, getPressOutlets } from "@/lib/press";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  absoluteUrl,
  pressArticles,
  routeMetadata,
  siteConfig,
  type PressArticle,
} from "@/lib/site-config";

/**
 * Press & News landing (`/press`).
 *
 * A marketing-style press hub: a split hero, a "Latest press releases" panel
 * paired with a media-kit card, a "Featured in" coverage strip, and a newsletter
 * band. The full long-form releases (with their stable legacy anchors) live on
 * `/press/releases`, linked from here. Styling is token-only and entrances use
 * the reduced-motion-aware {@link ScrollReveal}.
 */

const press = routeMetadata.press;

export const metadata: Metadata = {
  title: press.title,
  description: press.description,
  alternates: { canonical: absoluteUrl(press.path) },
  openGraph: {
    type: press.ogType,
    siteName: siteConfig.name,
    title: press.title,
    description: press.description,
    url: absoluteUrl(press.path),
    images: [{ url: press.ogImage, width: 1200, height: 630, alt: press.title }],
  },
  twitter: {
    card: press.twitterCard,
    title: press.title,
    description: press.description,
    images: [press.ogImage],
  },
};

/** Map an article category to a representative icon for the list rows. */
const CATEGORY_ICON: Record<PressArticle["category"], LucideIcon> = {
  "Company News": Newspaper,
  "Press Coverage": Megaphone,
  Awards: Award,
  Research: FlaskConical,
};

/** Latest four releases (data is newest-first in site-config). */
const LATEST = pressArticles.slice(0, 4);

/** Outlets (with logos) that have covered BioAnalytiX — shown as a marquee. */
const OUTLETS = getPressOutlets();

export default function PressPage() {
  return (
    <>
      <PressHero />
      <LatestReleases />
      <CoverageStrip />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

function PressHero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-24 h-[34rem] w-[34rem] rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="absolute -left-40 top-40 h-[26rem] w-[26rem] rounded-full bg-primary/[0.05] blur-3xl" />
      </div>

      <div className="container py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
              Press
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
              News and updates from{" "}
              <span className="text-primary">BioAnalytiX.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Stay up to date with our latest announcements, product updates,
              research milestones, and media coverage.
            </p>
            <div className="mt-9">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Contact press team
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120} className="min-w-0">
            <PressHeroIllustration className="h-auto w-full" />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}


/* -------------------------------------------------------------------------- */
/* Latest press releases + media kit                                          */
/* -------------------------------------------------------------------------- */

function LatestReleases() {
  return (
    <section className="pb-4 md:pb-8">
      <div className="container">
        <ScrollReveal>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8">
            <div>
              {/* List */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink">
                  Latest press releases
                </p>

                <ul className="mt-5">
                  {LATEST.map((article) => {
                    const Icon = CATEGORY_ICON[article.category];
                    const img = articleImage(article.slug);
                    return (
                      <li key={article.slug}>
                        <Link
                          href={`/press/releases/${article.slug}`}
                          className="group flex items-center gap-4 border-b border-border py-4 transition-colors hover:bg-background/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                        >
                          <span className="inline-flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white text-primary">
                            {img ? (
                              <img src={img} alt="" className="h-full w-full object-cover object-center" />
                            ) : (
                              <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold text-foreground">
                              {article.title}
                            </span>
                            <span className="mt-0.5 line-clamp-1 block text-sm text-muted">
                              {article.excerpt}
                            </span>
                          </span>
                          <time
                            dateTime={article.date}
                            className="hidden shrink-0 text-xs font-medium text-muted sm:block"
                          >
                            {article.dateLabel}
                          </time>
                          <ChevronRight
                            aria-hidden
                            className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6">
                  <Link
                    href="/press/releases"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    View all press releases
                    <ChevronRight aria-hidden className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Coverage strip                                                             */
/* -------------------------------------------------------------------------- */

function CoverageStrip() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <ScrollReveal>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink">
            Press coverage
          </p>
          <h2 className="mt-2 text-foreground">Featured in</h2>

          <div className="relative mt-8 overflow-hidden">
            <Marquee className="[--duration:35s] [--gap:3rem]">
              {OUTLETS.map((outlet) => (
                <a
                  key={outlet.url}
                  href={outlet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={outlet.name}
                  className="flex items-center"
                >
                  <img
                    src={outlet.logo}
                    alt={outlet.name}
                    className={cn(
                      "w-auto max-w-[10rem] object-contain transition-transform duration-200 hover:scale-105",
                      outlet.dark
                        ? "h-12 rounded-lg bg-foreground px-3 py-1.5 md:h-14"
                        : "h-9 md:h-11",
                    )}
                  />
                </a>
              ))}
            </Marquee>
            {/* edge fades */}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/press/coverage"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-lg")}
            >
              View all coverage
              <ChevronRight aria-hidden className="size-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
