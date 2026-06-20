import { expect, test } from "@playwright/test";

/**
 * End-to-end smoke tests (Task 13.1).
 *
 * Coverage:
 *  - Every public route renders with its key heading and a 200 status
 *    (Requirements 1.1, 1.6).
 *  - An unknown path renders the branded 404 with a 404 status (Requirement 1.6).
 *  - A legacy URL (`/About_us`) redirects to the rebuilt `/about` (Requirement 1.5).
 *  - Navbar route links navigate to standalone routes (Requirement 2.7) and an
 *    in-page anchor scrolls to `#contact` on the home page (Requirement 2.4).
 *  - The contact form happy path succeeds and shows its confirmation, exercising
 *    the Server Action against the stubbed provider endpoint (Requirement 3.9).
 */

/** Each indexable route paired with the exact heading it should render. */
const ROUTES: { path: string; heading: string | RegExp }[] = [
  { path: "/", heading: /A new era for radiology/i },
  { path: "/about", heading: "Pioneering the future of medical AI" },
  { path: "/product", heading: "Next-generation medical diagnostics" },
  { path: "/press", heading: /News and updates from BioAnalytiX/i },
  { path: "/careers", heading: /Shape the future of medical AI/i },
  { path: "/privacy-policy", heading: "Privacy Policy" },
  { path: "/terms-conditions", heading: "Terms & Conditions" },
];

test.describe("route rendering", () => {
  for (const { path, heading } of ROUTES) {
    test(`renders ${path} with a 200 and its heading`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status(), `status for ${path}`).toBe(200);

      await expect(
        page.getByRole("heading", { name: heading, level: 1 }),
      ).toBeVisible();
    });
  }

  test("unknown path renders the branded 404", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);

    await expect(
      page.getByRole("heading", { name: "Page not found", level: 1 }),
    ).toBeVisible();
  });
});

test.describe("legacy redirects", () => {
  test("/About_us redirects to /about", async ({ page }) => {
    await page.goto("/About_us");

    await expect(page).toHaveURL(/\/about$/);
    await expect(
      page.getByRole("heading", {
        name: "Pioneering the future of medical AI",
        level: 1,
      }),
    ).toBeVisible();
  });
});

test.describe("navigation", () => {
  test("navbar link routes to a standalone page", async ({ page }) => {
    await page.goto("/");

    const primaryNav = page.getByRole("navigation", { name: "Primary" });
    await primaryNav.getByRole("link", { name: "About", exact: true }).click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(
      page.getByRole("heading", {
        name: "Pioneering the future of medical AI",
        level: 1,
      }),
    ).toBeVisible();
  });

  test("in-page anchor scrolls to #contact on the home page", async ({
    page,
  }) => {
    await page.goto("/");

    const primaryNav = page.getByRole("navigation", { name: "Primary" });
    await primaryNav
      .getByRole("link", { name: "Contact", exact: true })
      .click();

    // The navbar reflects the resolved anchor in the URL hash (Requirement 2.4).
    await expect(page).toHaveURL(/#contact$/);

    // The contact section heading should be scrolled into the viewport.
    const contactHeading = page.getByRole("heading", {
      name: "Let’s talk",
      level: 2,
    });
    await expect(contactHeading).toBeVisible();
    await expect(contactHeading).toBeInViewport();
  });
});

test.describe("contact form", () => {
  test("happy path submits and shows the success confirmation", async ({
    page,
  }) => {
    await page.goto("/#contact");

    await page.getByLabel("Name").fill("Ada Lovelace");
    await page.getByLabel("Email").fill("ada@example.com");
    await page
      .getByLabel("Message")
      .fill("Hello BioAnalytiX team — this is an end-to-end smoke test.");

    await page.getByRole("button", { name: "Send message" }).click();

    // The Server Action delivers to the stubbed provider (200) and the form
    // swaps in its success confirmation (Requirement 3.9).
    await expect(page.getByText("Message sent")).toBeVisible();
    await expect(
      page.getByText(/your message has been sent/i),
    ).toBeVisible();
  });
});
