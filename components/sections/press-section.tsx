import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pressArticles } from "@/lib/site-config";

/**
 * Press section (Home Page Section Design item 5; Requirements 1.2, 1.3).
 *
 * Surfaces recent press / news as light cards with anchor-stable ids. Each card
 * carries `id={article.slug}` — the same stable, unique slug (matching
 * `^[a-z0-9-]+$`) used by the Press page — and links to `/press#<slug>` so a
 * shared or indexed fragment resolves to the matching article on the dedicated
 * page (Requirement 7 anchor stability is owned by the Press page; the home
 * cards reuse the same ids).
 *
 * Styling is token-only (no color literals): the `py-16 md:py-24` rhythm inside
 * the `max-w-7xl` container, an `overline` eyebrow in `--primary`, a bold `h2`,
 * and SaaS-style cards (white surface, `--border` hairline, `shadow-sm`,
 * `rounded-lg`) that lift to `shadow-md` and tint their border toward `--primary`
 * on hover. The grid uses the `gap-8` rhythm and staggered {@link ScrollReveal}
 * entrance.
 */

/** Number of recent articles surfaced on the home page. */
const HOME_PRESS_COUNT = 3;

export function PressSection() {
  const recent = pressArticles.slice(0, HOME_PRESS_COUNT);

  return (
    <section id="press" className="bg-surface py-16 md:py-24">
      <div className="container">
        <ScrollReveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                Press &amp; news
              </p>
              <h2 className="mt-4 text-foreground">
                Recognition and milestones
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Awards, partnerships, and coverage from our journey to bring
                AI-powered diagnostics into everyday clinical practice.
              </p>
            </div>

            <Link
              href="/press"
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              View all news
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </ScrollReveal>

        <ul className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {recent.map((article, index) => (
            <li key={article.slug} id={article.slug}>
              <ScrollReveal delay={index * 100} className="h-full">
                <Link
                  href={`/press#${article.slug}`}
                  className="group flex h-full flex-col rounded-lg border border-border bg-background p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em]">
                    <span className="text-primary">{article.category}</span>
                    <span aria-hidden="true" className="text-border">
                      /
                    </span>
                    <span className="text-muted">{article.dateLabel}</span>
                  </div>

                  <h3 className="mt-4 text-foreground">{article.title}</h3>

                  <p className="mt-3 flex-1 text-base leading-relaxed text-muted">
                    {article.excerpt}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Read more
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default PressSection;
