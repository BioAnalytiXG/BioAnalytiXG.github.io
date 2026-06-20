import { pressArticles, type PressArticle } from "@/lib/site-config";

/**
 * Listing item shapes + derivations for the filterable Press listing pages
 * (`/press/releases` and `/press/coverage`).
 *
 * Both pages share one card/list/filter UI ({@link "@/components/press/article-explorer"}).
 * A {@link ListingItem} represents ONE news story:
 *  - Releases: our own announcement, linking to its full per-article page.
 *  - Coverage: a story that external outlets wrote about — the SAME news can be
 *    covered by several websites, so each coverage card groups all the outlet
 *    links (`sources`) under one story instead of repeating the title per site.
 */

export type PubType =
  | "News"
  | "Magazine"
  | "Blog"
  | "Interview"
  | "Press Release"
  | "Research";

export interface CoverageSource {
  label: string;
  href: string;
}

export interface ListingItem {
  id: string;
  slug: string;
  category: PressArticle["category"];
  pubType: PubType;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD) used for sorting / year filtering. */
  date: string;
  dateLabel: string;
  /** Representative image / logo for the story (card thumbnail). */
  image?: string;
  /** Releases: name shown if no image is available. */
  outlet?: string;
  /** Releases: internal link to the full story. */
  href?: string;
  /** Coverage: every outlet that covered this story (one or more). */
  sources?: CoverageSource[];
  external: boolean;
}

/** Per-story image / logo, drawn from the existing award & partner assets. */
const ARTICLE_IMAGE: Record<string, string> = {
  "partnership-renewal": "/images/partners/general-hospital-larissa.jpg",
  forbes: "/images/awards/forbes.jpg",
  acta: "/images/partners/acta-lab.png",
  innohealth: "/images/awards/innohealth-2024.png",
  yerame: "/images/awards/yerame.jpg",
  ennovation: "/images/awards/ennovation-2024.png",
};

/** Public image path for a story, if one exists. */
export function articleImage(slug: string): string | undefined {
  return ARTICLE_IMAGE[slug];
}

/** Publication type derived from the article category. */
function articlePubType(category: PressArticle["category"]): PubType {
  switch (category) {
    case "Research":
      return "Research";
    case "Awards":
    case "Press Coverage":
      return "News";
    case "Company News":
    default:
      return "Press Release";
  }
}

/** Our press releases — one item per article, linking to its full story. */
export function getReleaseItems(): ListingItem[] {
  return pressArticles.map((a) => ({
    id: a.slug,
    slug: a.slug,
    category: a.category,
    pubType: articlePubType(a.category),
    title: a.title,
    description: a.excerpt,
    date: a.date,
    dateLabel: a.dateLabel,
    image: articleImage(a.slug),
    outlet: "BioAnalytiX",
    href: `/press/releases/${a.slug}`,
    external: false,
  }));
}

/**
 * External coverage — one item per STORY that outlets covered, grouping every
 * outlet link together (so the same news isn't repeated once per website).
 */
export function getCoverageItems(): ListingItem[] {
  return pressArticles
    .filter((a) => (a.sources?.length ?? 0) > 0)
    .map((a) => ({
      id: a.slug,
      slug: a.slug,
      category: a.category,
      pubType: articlePubType(a.category),
      title: a.title,
      description: a.excerpt,
      date: a.date,
      dateLabel: a.dateLabel,
      image: articleImage(a.slug),
      sources: a.sources,
      external: true,
    }))
    .sort((x, y) => (x.date < y.date ? 1 : -1));
}

/* -------------------------------------------------------------------------- */
/* "Featured in" press outlets (logos for the marquee)                        */
/* -------------------------------------------------------------------------- */

export interface PressOutlet {
  name: string;
  logo: string;
  url: string;
  /** Logo is light/white artwork → render on a dark chip so it stays visible. */
  dark?: boolean;
}

/** Outlet name → logo asset (filenames as provided in /public/images/press-outlets). */
const OUTLET_LOGOS: Record<string, string> = {
  "Forbes Greece": "/images/press-outlets/forbes-greece.png",
  "ERT News": "/images/press-outlets/ert-news.png",
  Eleftheria: "/images/press-outlets/eleftheria.svg",
  "New Money": "/images/press-outlets/new-money.svg",
  "Larissa Press": "/images/press-outlets/larissa-press.png",
  "University of Thessaly": "/images/press-outlets/university-of-thessaly.png",
  "On Larissa": "/images/press-outlets/on-larissa.png",
  MAG24: "/images/press-outlets/mag24.png",
  "Innovation Hive": "/images/press-outlets/innovation-hive.webp",
};

/** Outlets whose logo artwork is light/white and needs a dark backdrop. */
const OUTLET_DARK = new Set<string>(["Larissa Press"]);

/**
 * Outlets that have covered BioAnalytiX, paired with their logo and a link to
 * the coverage. URLs are resolved from the article `sources` so the data stays
 * single-sourced; only outlets we have a logo for are included.
 */
export function getPressOutlets(): PressOutlet[] {
  const url = new Map<string, string>();
  for (const a of pressArticles) {
    for (const s of a.sources ?? []) {
      if (!url.has(s.label)) url.set(s.label, s.href);
    }
  }
  return Object.keys(OUTLET_LOGOS)
    .filter((name) => url.has(name))
    .map((name) => ({
      name,
      logo: OUTLET_LOGOS[name],
      url: url.get(name) as string,
      dark: OUTLET_DARK.has(name),
    }));
}
