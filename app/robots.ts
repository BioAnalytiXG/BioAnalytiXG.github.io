import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-config";

/**
 * robots.txt (served at /robots.txt).
 *
 * Permits indexing of every route (Requirement 8.4) and references the
 * published sitemap URL so crawlers can discover the indexable route set. The
 * 404 page is excluded from the sitemap by construction (Requirement 8.5), so
 * no route-level disallow rules are required here.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
