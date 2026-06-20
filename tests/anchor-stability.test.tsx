/**
 * Property 3: Anchor stability.
 *
 * Validates: Requirements 7.1, 7.2
 *
 * Confirms that existing/indexed press anchor links keep resolving after the
 * rebuild:
 *
 *  (1) One element id per legacy anchor (Req 7.1) — every legacy press anchor,
 *      including the known legacy anchor `partnership-renewal`, maps to exactly
 *      one `pressArticles` entry whose slug equals that anchor. Because the
 *      Press page renders one `<article id={article.slug}>` per article, a
 *      one-to-one slug match guarantees exactly one element id per legacy
 *      anchor. This data-level assertion is robust to render internals and is
 *      preferred over mounting the full (effect-heavy) page.
 *
 *  (2) Slug shape + uniqueness (Req 7.2) — every article slug matches
 *      `^[a-z0-9-]+$` (the shared `PRESS_SLUG_PATTERN`) and all slugs are unique
 *      across the data source, so the rendered element ids are valid, stable,
 *      and collision-free anchor targets.
 */
import { describe, expect, it } from "vitest";

import {
  PRESS_SLUG_PATTERN,
  legacyPressAnchors,
  pressArticles,
} from "@/lib/site-config";

describe("Property 3: Anchor stability — one element id per legacy anchor (Req 7.1)", () => {
  it("includes the known legacy `partnership-renewal` anchor", () => {
    expect(legacyPressAnchors).toContain("partnership-renewal");
  });

  it.each([...legacyPressAnchors])(
    "maps legacy anchor %s to exactly one article slug",
    (anchor) => {
      const matches = pressArticles.filter(
        (article) => article.slug === anchor,
      );
      // Exactly one article carries this slug, so the Press page renders exactly
      // one element with this id.
      expect(matches).toHaveLength(1);
    },
  );

  it("covers every legacy anchor with a corresponding article (no missing ids)", () => {
    const slugs = new Set(pressArticles.map((article) => article.slug));
    for (const anchor of legacyPressAnchors) {
      expect(slugs.has(anchor)).toBe(true);
    }
  });
});

describe("Property 3: Anchor stability — slug shape and uniqueness (Req 7.2)", () => {
  it.each(pressArticles.map((article) => article.slug))(
    "slug %s matches ^[a-z0-9-]+$",
    (slug) => {
      expect(slug).toMatch(PRESS_SLUG_PATTERN);
    },
  );

  it("uses the documented slug pattern", () => {
    expect(PRESS_SLUG_PATTERN.source).toBe("^[a-z0-9-]+$");
  });

  it("has unique slugs across all articles (no duplicate anchor ids)", () => {
    const slugs = pressArticles.map((article) => article.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it("has unique legacy anchors (no duplicate legacy ids)", () => {
    const unique = new Set(legacyPressAnchors);
    expect(unique.size).toBe(legacyPressAnchors.length);
  });
});
