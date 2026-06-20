import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ArticleExplorer } from "@/components/press/article-explorer";
import { CoverageHeroIllustration } from "@/components/press/coverage-hero-illustration";
import type { ListingItem } from "@/lib/press";

export interface PressListingProps {
  /** Breadcrumb leaf + nav context (e.g. "Coverage" or "Press Releases"). */
  crumb: string;
  eyebrow: string;
  /** Title rendered as `{lead} {accent}` with the accent in the brand color. */
  titleLead: string;
  titleAccent: string;
  subtitle: string;
  items: ListingItem[];
  emptyLabel?: string;
}

/**
 * Shared Press listing template (breadcrumb + split hero + filterable explorer
 * + newsletter band). Powers both `/press/coverage` and `/press/releases` so
 * the two destinations share one consistent, on-brand design.
 */
export function PressListing({
  crumb,
  eyebrow,
  titleLead,
  titleAccent,
  subtitle,
  items,
  emptyLabel,
}: PressListingProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-32 -top-24 h-[34rem] w-[34rem] rounded-full bg-primary/[0.06] blur-3xl" />
        </div>

        <div className="container pt-10 md:pt-14">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <Link href="/press" className="hover:text-foreground">
                  Press
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5" />
              </li>
              <li className="font-medium text-foreground">{crumb}</li>
            </ol>
          </nav>
        </div>

        <div className="container pb-10 pt-8 md:pb-14">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <ScrollReveal className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
                {eyebrow}
              </p>
              <h1 className="mt-4 max-w-xl text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl">
                {titleLead} <span className="text-primary">{titleAccent}</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
                {subtitle}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={120} className="min-w-0">
              <CoverageHeroIllustration className="h-auto w-full" />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Filterable list */}
      <section className="border-t border-border py-12 md:py-16">
        <div className="container">
          <ArticleExplorer items={items} emptyLabel={emptyLabel} />
        </div>
      </section>
    </>
  );
}

export default PressListing;
