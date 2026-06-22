import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { CtaSection } from "@/components/sections/cta-section";
import {
  absoluteUrl,
  getPressArticle,
  pressArticles,
  siteConfig,
  type PressArticle,
} from "@/lib/site-config";
import { articleImage } from "@/lib/press";

/** Pre-render a static page for every press release. */
export function generateStaticParams() {
  return pressArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getPressArticle(slug);
  if (!article) return { title: "Press Release" };

  const url = absoluteUrl(`/press/releases/${article.slug}`);
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: siteConfig.name,
      title: article.title,
      description: article.excerpt,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
    },
  };
}

/**
 * Inline markdown: bold (**text**), and strips any remaining asterisks.
 * Returns an array of strings/spans safe to render inside a block element.
 */
function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * Markdown renderer supporting:
 * - `## ` / `### ` headings
 * - `- ` unordered lists
 * - `> ` blockquotes
 * - `---` horizontal rule
 * - `**bold**` inline emphasis
 * - Plain paragraphs
 * - Lines containing only `FOR IMMEDIATE RELEASE` styled as an eyebrow label
 */
function renderBody(body: string): ReactNode[] {
  const lines = body.split("\n");
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let quoteLines: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    const items = listItems;
    listItems = [];
    blocks.push(
      <ul
        key={`ul-${key++}`}
        className="my-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-muted marker:text-primary"
      >
        {items.map((it, i) => (
          <li key={i}>{renderInline(it)}</li>
        ))}
      </ul>,
    );
  };

  const flushQuote = () => {
    if (quoteLines.length === 0) return;
    const content = quoteLines;
    quoteLines = [];
    blocks.push(
      <blockquote
        key={`bq-${key++}`}
        className="my-6 border-l-4 border-primary pl-5"
      >
        {content.map((line, i) => (
          <p key={i} className="text-base italic leading-relaxed text-muted">
            {renderInline(line)}
          </p>
        ))}
      </blockquote>,
    );
  };

  const flushAll = () => {
    flushList();
    flushQuote();
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (line === "") {
      flushAll();
      continue;
    }

    if (line === "---") {
      flushAll();
      blocks.push(<hr key={`hr-${key++}`} className="my-8 border-border" />);
      continue;
    }

    if (line.startsWith("### ")) {
      flushAll();
      blocks.push(
        <h3 key={`h3-${key++}`} className="mt-8 text-foreground">
          {renderInline(line.slice(4))}
        </h3>,
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushAll();
      blocks.push(
        <h2 key={`h2-${key++}`} className="mt-10 text-foreground">
          {renderInline(line.slice(3))}
        </h2>,
      );
      continue;
    }

    if (line.startsWith("> ")) {
      flushList();
      quoteLines.push(line.slice(2));
      continue;
    }

    if (line.startsWith("- ")) {
      flushQuote();
      listItems.push(line.slice(2));
      continue;
    }

    flushAll();

    // "FOR IMMEDIATE RELEASE" eyebrow treatment
    if (line === "FOR IMMEDIATE RELEASE") {
      blocks.push(
        <p
          key={`eyebrow-${key++}`}
          className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink"
        >
          {line}
        </p>,
      );
      continue;
    }

    blocks.push(
      <p key={`p-${key++}`} className="mt-4 text-base leading-relaxed text-muted">
        {renderInline(line)}
      </p>,
    );
  }
  flushAll();
  return blocks;
}

export default async function PressReleasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article: PressArticle | undefined = getPressArticle(slug);
  if (!article) notFound();

  const image = articleImage(article.slug);

  return (
    <>
      <article className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/press/releases"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              <ArrowLeft aria-hidden className="size-4" />
              All press releases
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em]">
              <span className="text-brand-ink">{article.category}</span>
              <span aria-hidden className="text-border">•</span>
              <time dateTime={article.date} className="text-muted">
                {article.dateLabel}
              </time>
            </div>

            <h1 className="mt-4 text-foreground">{article.title}</h1>
            <p className="mt-6 text-xl leading-relaxed text-muted">{article.excerpt}</p>

            {image ? (
              <div className="mt-8 overflow-hidden rounded-xl border border-border aspect-[4/3]">
                <img
                  src={image}
                  alt={article.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ) : null}

            <div className="mt-8 border-t border-border pt-8">{renderBody(article.body)}</div>

            {article.sources && article.sources.length > 0 ? (
              <div className="mt-10 border-t border-border pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                  Coverage
                </p>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                  {article.sources.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {s.label}
                        <ArrowUpRight aria-hidden className="size-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </article>

      <CtaSection />
    </>
  );
}
