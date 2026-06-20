/**
 * Property 6: SEO completeness.
 *
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4
 *
 * Confirms that every route ships complete, correct SEO metadata and that the
 * sitemap/robots cover exactly the indexable route set:
 *
 *  (1) Title / description (Req 8.1) — every route defined in Requirement 1
 *      (the eight pages, including the 404) carries a non-empty `title` of at
 *      most 60 characters and a non-empty `description` between 50 and 160
 *      characters. This is asserted against the single source of truth
 *      (`routeMetadata` in `lib/site-config.ts`) AND against the metadata the
 *      page modules actually export.
 *
 *  (2) Canonical (Req 8.2) — every indexable route exports an `alternates.
 *      canonical` that is an absolute URL rooted at `https://bioanalytix.info`.
 *
 *  (3) Open Graph / Twitter (Req 8.3) — every indexable route exports Open
 *      Graph metadata with a non-empty title, non-empty description, absolute
 *      `url`, a `type`, and exactly one image of at least 1200x630, plus a
 *      Twitter card whose type is `summary_large_image`.
 *
 *  (4) Sitemap / robots (Req 8.4, 8.5) — `app/sitemap.ts` lists the absolute
 *      URL of every indexable route and excludes the `noindex` 404 page;
 *      `app/robots.ts` permits indexing of "/" and references the absolute
 *      `/sitemap.xml` URL.
 *
 * The page modules pull in client components that transitively import the form
 * Server Actions, so those actions (and `next/headers`) are mocked to keep the
 * metadata imports deterministic in the jsdom environment. Only the static
 * `metadata` export of each page is read — no page is rendered.
 */
import type { Metadata } from "next";
import { describe, expect, it, vi } from "vitest";

import {
  SITE_URL,
  absoluteUrl,
  indexableRouteKeys,
  pressArticles,
  routeMetadata,
  type RouteKey,
} from "@/lib/site-config";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

// The form Server Actions (and Next's request-scoped `next/headers`) are pulled
// in transitively when importing the home/careers page modules. They are not
// relevant to metadata, so stub them out to keep imports side-effect free.
vi.mock("@/app/actions/submit-contact", () => ({
  submitContact: vi.fn(),
}));
vi.mock("@/app/actions/submit-beta", () => ({
  submitBeta: vi.fn(),
}));
vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Map()),
  cookies: vi.fn(() => new Map()),
}));

// Eagerly import every page module's `metadata` export. The glob keys are the
// module paths; we map them to route keys below.
const pageMetadataByKey: Partial<Record<RouteKey, Metadata>> = {
  home: (await import("@/app/page")).metadata,
  about: (await import("@/app/about/page")).metadata,
  product: (await import("@/app/product/page")).metadata,
  gnosis: (await import("@/app/gnosis-ai/page")).metadata,
  beta: (await import("@/app/beta/page")).metadata,
  dataPartner: (await import("@/app/data-partner/page")).metadata,
  press: (await import("@/app/press/page")).metadata,
  careers: (await import("@/app/careers/page")).metadata,
  privacy: (await import("@/app/privacy-policy/page")).metadata,
  terms: (await import("@/app/terms-conditions/page")).metadata,
};

const notFoundMetadata: Metadata = (await import("@/app/not-found")).metadata;

const TITLE_MAX = 60;
const DESCRIPTION_MIN = 50;
const DESCRIPTION_MAX = 160;
const OG_MIN_WIDTH = 1200;
const OG_MIN_HEIGHT = 630;

const ALL_ROUTE_KEYS = Object.keys(routeMetadata) as RouteKey[];

/** Pull a plain string out of a Next `title` field (string or { default }). */
function titleToString(title: Metadata["title"]): string {
  if (typeof title === "string") {
    return title;
  }
  if (title && typeof title === "object" && "default" in title) {
    return String(title.default ?? "");
  }
  return "";
}

/** True when `value` is an absolute URL rooted at the production origin. */
function isRootedAbsoluteUrl(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}` === SITE_URL;
  } catch {
    return false;
  }
}

describe("Property 6: SEO completeness — title & description (Req 8.1)", () => {
  it("covers all routes from Requirement 1", () => {
    expect(ALL_ROUTE_KEYS).toHaveLength(11);
  });

  // Source-of-truth check: every route (including the noindex 404) has a valid
  // title and description in the shared route-metadata config.
  it.each(ALL_ROUTE_KEYS)(
    "route '%s' defines a non-empty title <= 60 chars (Req 8.1)",
    (key) => {
      const { title } = routeMetadata[key];
      expect(title.trim().length).toBeGreaterThan(0);
      expect(title.length).toBeLessThanOrEqual(TITLE_MAX);
    },
  );

  it.each(ALL_ROUTE_KEYS)(
    "route '%s' defines a description of 50-160 chars (Req 8.1)",
    (key) => {
      const { description } = routeMetadata[key];
      expect(description.trim().length).toBeGreaterThan(0);
      expect(description.length).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
      expect(description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    },
  );

  // The page modules must actually export the title/description they advertise.
  it.each(indexableRouteKeys)(
    "page module '%s' exports a valid title and description (Req 8.1)",
    (key) => {
      const metadata = pageMetadataByKey[key];
      expect(metadata, `page module for '${key}' should export metadata`).toBeDefined();

      const title = titleToString(metadata!.title);
      expect(title.trim().length).toBeGreaterThan(0);
      expect(title.length).toBeLessThanOrEqual(TITLE_MAX);

      const description = String(metadata!.description ?? "");
      expect(description.trim().length).toBeGreaterThan(0);
      expect(description.length).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
      expect(description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    },
  );
});

describe("Property 6: SEO completeness — canonical URLs (Req 8.2)", () => {
  it.each(indexableRouteKeys)(
    "page module '%s' exports an absolute canonical rooted at the origin (Req 8.2)",
    (key) => {
      const metadata = pageMetadataByKey[key];
      const canonical = metadata?.alternates?.canonical;

      expect(canonical, `'${key}' must export a canonical URL`).toBeDefined();
      expect(
        isRootedAbsoluteUrl(canonical),
        `'${key}' canonical (${String(canonical)}) must be absolute and rooted at ${SITE_URL}`,
      ).toBe(true);
      // The canonical must resolve to the route's configured path.
      expect(canonical).toBe(absoluteUrl(routeMetadata[key].path));
    },
  );
});

describe("Property 6: SEO completeness — Open Graph & Twitter (Req 8.3)", () => {
  it.each(indexableRouteKeys)(
    "page module '%s' exports complete Open Graph metadata (Req 8.3)",
    (key) => {
      const og = pageMetadataByKey[key]?.openGraph;
      expect(og, `'${key}' must export openGraph metadata`).toBeDefined();

      // Non-empty title & description.
      expect(titleToString(og!.title as Metadata["title"]).trim().length).toBeGreaterThan(0);
      expect(String((og as { description?: unknown }).description ?? "").trim().length).toBeGreaterThan(0);

      // A `type` value (e.g. "website").
      expect(String((og as { type?: unknown }).type ?? "").length).toBeGreaterThan(0);

      // An absolute `url`.
      expect(
        isRootedAbsoluteUrl((og as { url?: unknown }).url),
        `'${key}' openGraph.url must be absolute`,
      ).toBe(true);

      // Exactly one image of at least 1200x630.
      const images = (og as { images?: unknown }).images;
      expect(Array.isArray(images), `'${key}' openGraph.images must be an array`).toBe(true);
      const imageList = images as Array<{ url?: unknown; width?: number; height?: number }>;
      expect(imageList).toHaveLength(1);

      const [image] = imageList;
      expect(String(image.url ?? "").length).toBeGreaterThan(0);
      expect(image.width ?? 0).toBeGreaterThanOrEqual(OG_MIN_WIDTH);
      expect(image.height ?? 0).toBeGreaterThanOrEqual(OG_MIN_HEIGHT);
    },
  );

  it.each(indexableRouteKeys)(
    "page module '%s' exports a summary_large_image Twitter card (Req 8.3)",
    (key) => {
      const twitter = pageMetadataByKey[key]?.twitter as { card?: unknown } | undefined;
      expect(twitter, `'${key}' must export twitter metadata`).toBeDefined();
      expect(twitter!.card).toBe("summary_large_image");
    },
  );
});

describe("Property 6: SEO completeness — sitemap & robots (Req 8.4, 8.5)", () => {
  const entries = sitemap();
  const robotsResult = robots();

  // The sitemap is the indexable base routes PLUS the nested press routes that
  // are not part of `routeMetadata`: the two press listing pages and one entry
  // per press release (`/press/releases/<slug>`).
  const pressListingPaths = ["/press/releases", "/press/coverage"];
  const expectedSitemapUrls = [
    ...indexableRouteKeys.map((key) => absoluteUrl(routeMetadata[key].path)),
    ...pressListingPaths.map((path) => absoluteUrl(path)),
    ...pressArticles.map((article) =>
      absoluteUrl(`/press/releases/${article.slug}`),
    ),
  ];

  it("lists one entry per indexable route plus the nested press routes (Req 8.4)", () => {
    expect(entries).toHaveLength(expectedSitemapUrls.length);
  });

  it("uses absolute URLs that match each indexable route's canonical (Req 8.4)", () => {
    const expected = [...expectedSitemapUrls].sort();
    const actual = entries.map((entry) => entry.url).sort();

    expect(actual).toEqual(expected);
    for (const entry of entries) {
      expect(isRootedAbsoluteUrl(entry.url)).toBe(true);
    }
  });

  it("excludes the noindex 404 page from the sitemap (Req 8.5)", () => {
    const notFoundUrl = absoluteUrl(routeMetadata.notFound.path);
    const urls = entries.map((entry) => entry.url);
    expect(urls).not.toContain(notFoundUrl);
  });

  it("marks the 404 metadata as noindex (Req 8.5)", () => {
    const robotsMeta = notFoundMetadata.robots as
      | { index?: boolean; follow?: boolean }
      | undefined;
    expect(robotsMeta).toBeDefined();
    expect(robotsMeta!.index).toBe(false);
  });

  it("permits indexing of '/' (Req 8.4)", () => {
    const rules = robotsResult.rules as { userAgent?: string; allow?: unknown };
    expect(rules.allow).toBe("/");
  });

  it("references the absolute sitemap URL (Req 8.4)", () => {
    expect(robotsResult.sitemap).toBe(absoluteUrl("/sitemap.xml"));
    expect(isRootedAbsoluteUrl(robotsResult.sitemap)).toBe(true);
  });
});
