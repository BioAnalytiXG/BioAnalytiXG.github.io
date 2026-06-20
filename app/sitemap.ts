import type { MetadataRoute } from "next";

import {
  absoluteUrl,
  indexableRouteKeys,
  pressArticles,
  routeMetadata,
} from "@/lib/site-config";

/**
 * XML sitemap (served at /sitemap.xml).
 *
 * Lists every indexable URL. The base set is derived from `indexableRouteKeys`
 * (`routeMetadata` minus any `noindex` route, so the 404 is omitted —
 * Requirement 8.4/8.5). On top of that we add the nested press routes that are
 * not part of `routeMetadata`: the two press listing pages and one entry per
 * press release (`/press/releases/<slug>`). Each `url` resolves through
 * `absoluteUrl()` so it matches the canonical URLs in per-route metadata.
 *
 * The home route gets the highest priority and a more frequent change cadence;
 * the press hub/listings are weighted slightly above the standard pages, and
 * individual releases sit at the default content priority.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Base routes from the shared metadata source.
  const baseEntries: MetadataRoute.Sitemap = indexableRouteKeys.map((key) => {
    const { path } = routeMetadata[key];
    const isHome = path === "/";
    return {
      url: absoluteUrl(path),
      lastModified,
      changeFrequency: isHome ? "weekly" : "monthly",
      priority: isHome ? 1 : 0.7,
    };
  });

  // Press listing pages (not in routeMetadata).
  const pressListingEntries: MetadataRoute.Sitemap = [
    "/press/releases",
    "/press/coverage",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // One entry per press release, dated by the article.
  const releaseEntries: MetadataRoute.Sitemap = pressArticles.map((article) => ({
    url: absoluteUrl(`/press/releases/${article.slug}`),
    lastModified: new Date(article.date),
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...baseEntries, ...pressListingEntries, ...releaseEntries];
}
