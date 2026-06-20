import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Automated accessibility (axe) and SEO-metadata presence checks (Task 13.2).
 *
 * Accessibility (Requirements 12.5, 12.6):
 *  - Each key route is scanned with axe-core using the WCAG 2.0/2.1 Level A and
 *    Level AA rule tags and is asserted to have ZERO violations. These are
 *    automated AA-level checks only; FULL WCAG AA conformance additionally
 *    requires manual testing with assistive technologies and expert review,
 *    which automated tooling (axe) cannot fully substitute for.
 *
 * SEO metadata presence (Requirement 8.1):
 *  - Each indexable route is asserted to render, at the level of the actual
 *    server-rendered <head>, a non-empty <title>, a meta description of
 *    50–160 characters, an absolute https://bioanalytix.info canonical link,
 *    Open Graph title/description/image/url tags, and a
 *    `summary_large_image` Twitter card.
 *
 * Both groups share the production build served by the Playwright `webServer`
 * (see `playwright.config.ts`), the same server the smoke suite uses.
 */

/** WCAG 2.0/2.1 Level A and AA rule tags for the automated AA-level scan. */
const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] as const;

/** Production canonical origin every canonical/OG URL must be rooted at. */
const SITE_ORIGIN = "https://bioanalytix.info";

/**
 * Key routes scanned for accessibility. Covers the home page (which hosts the
 * `#contact` form area), the standalone marketing pages, and the careers page
 * (which embeds the beta-application form). The contact area is additionally
 * scanned in isolation below.
 */
const A11Y_ROUTES = ["/", "/about", "/product", "/press", "/careers"] as const;

test.describe("accessibility (axe, WCAG A & AA)", () => {
  for (const route of A11Y_ROUTES) {
    test(`${route} has no automated WCAG A/AA violations`, async ({ page }) => {
      await page.goto(route);
      // Wait for the network to settle so lazy/hydrated UI is in the DOM.
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags([...WCAG_AA_TAGS])
        .analyze();

      // Surface a readable summary if anything fails.
      expect(
        results.violations,
        formatViolations(route, results.violations),
      ).toEqual([]);
    });
  }

  test("the #contact form area has no automated WCAG A/AA violations", async ({
    page,
  }) => {
    await page.goto("/#contact");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .include("#contact")
      .withTags([...WCAG_AA_TAGS])
      .analyze();

    expect(
      results.violations,
      formatViolations("#contact", results.violations),
    ).toEqual([]);
  });
});

/** Indexable routes whose rendered <head> must expose complete SEO metadata. */
const SEO_ROUTES = [
  "/",
  "/about",
  "/product",
  "/press",
  "/careers",
  "/privacy-policy",
  "/terms-conditions",
] as const;

test.describe("SEO metadata presence (rendered <head>)", () => {
  for (const route of SEO_ROUTES) {
    test(`${route} renders complete SEO metadata`, async ({ page }) => {
      await page.goto(route);

      // <title> is present and non-empty (Requirement 8.1).
      const title = (await page.title()).trim();
      expect(title.length, `non-empty <title> for ${route}`).toBeGreaterThan(0);

      // Meta description present and within the 50–160 char SEO window.
      const description = await metaContent(page, 'meta[name="description"]');
      expect(description, `meta description for ${route}`).not.toBeNull();
      expect(
        (description as string).length,
        `description length for ${route} ("${description}")`,
      ).toBeGreaterThanOrEqual(50);
      expect(
        (description as string).length,
        `description length for ${route} ("${description}")`,
      ).toBeLessThanOrEqual(160);

      // Canonical link is an absolute https://bioanalytix.info URL.
      const canonical = await attr(page, 'link[rel="canonical"]', "href");
      expect(canonical, `canonical link for ${route}`).not.toBeNull();
      expect(canonical as string).toMatch(
        new RegExp(`^${escapeRegExp(SITE_ORIGIN)}(/|$)`),
      );

      // Open Graph tags present and non-empty.
      for (const property of [
        "og:title",
        "og:description",
        "og:image",
        "og:url",
      ]) {
        const content = await metaContent(
          page,
          `meta[property="${property}"]`,
        );
        expect(content, `${property} for ${route}`).not.toBeNull();
        expect(
          (content as string).length,
          `${property} non-empty for ${route}`,
        ).toBeGreaterThan(0);
      }

      // og:url is rooted at the production origin.
      const ogUrl = await metaContent(page, 'meta[property="og:url"]');
      expect(ogUrl as string).toMatch(
        new RegExp(`^${escapeRegExp(SITE_ORIGIN)}(/|$)`),
      );

      // Twitter card is the large-image summary variant.
      const twitterCard = await metaContent(page, 'meta[name="twitter:card"]');
      expect(twitterCard, `twitter:card for ${route}`).toBe(
        "summary_large_image",
      );
    });
  }
});

/** Return the trimmed `content` of the first matching meta tag, or null. */
async function metaContent(
  page: import("@playwright/test").Page,
  selector: string,
): Promise<string | null> {
  return attr(page, selector, "content");
}

/** Return the trimmed value of an attribute on the first match, or null. */
async function attr(
  page: import("@playwright/test").Page,
  selector: string,
  name: string,
): Promise<string | null> {
  const value = await page.locator(selector).first().getAttribute(name);
  return value === null ? null : value.trim();
}

/** Escape a literal string for safe use inside a RegExp. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Build a readable failure message listing each axe violation. */
function formatViolations(
  label: string,
  violations: { id: string; help: string; nodes: { target: unknown[] }[] }[],
): string {
  if (violations.length === 0) {
    return `No accessibility violations on ${label}.`;
  }
  const lines = violations.map(
    (v) =>
      `  - [${v.id}] ${v.help} (${v.nodes.length} node${
        v.nodes.length === 1 ? "" : "s"
      }: ${v.nodes
        .map((n) => JSON.stringify(n.target))
        .join(", ")})`,
  );
  return `Accessibility violations on ${label}:\n${lines.join("\n")}`;
}
