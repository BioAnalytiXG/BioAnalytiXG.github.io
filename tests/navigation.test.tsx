/**
 * Navigation rendering tests.
 *
 * Validates: Requirements 2.1, 2.9, 2.10
 *
 * Covers that the single navigation-item source (`mainNav` + `mainNavCta`) is
 * rendered everywhere it should be and that the mobile drawer behaves:
 *
 *  - The desktop Navbar renders every `mainNav` label and exactly one primary
 *    CTA (the `mainNavCta` label) (Requirement 2.1).
 *  - The MobileNav Sheet, once opened via the hamburger trigger, renders every
 *    `mainNav` label plus the CTA inside the drawer (Requirement 2.9).
 *  - Selecting a link inside the MobileNav drawer closes it (Requirement 2.10).
 *
 * jsdom lacks `window.matchMedia` and `IntersectionObserver` (used by the
 * navbar's reduced-motion + scroll-spy hooks), and `scrollIntoView` is not
 * implemented, so all three are stubbed here.
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MobileNav } from "@/components/layout/mobile-nav";
import { Navbar } from "@/components/layout/navbar";
import { mainNav, mainNavCta } from "@/lib/site-config";

// next/navigation: the components call usePathname(); pin it to the home route.
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

/** matchMedia stub: reports motion is allowed and exposes spy-able listeners. */
function installMatchMediaStub() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

/** Minimal IntersectionObserver stub (the navbar scroll-spy hook constructs one). */
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {}
}

beforeEach(() => {
  installMatchMediaStub();
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  // jsdom does not implement scrollIntoView; the in-page anchor handlers call it.
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Navbar rendering (Requirement 2.1)", () => {
  it("renders every mainNav label from the single navigation source", () => {
    render(<Navbar />);

    for (const item of mainNav) {
      // Each label appears in the desktop list (and again in the hidden mobile
      // drawer once opened); at least one rendered instance must exist here.
      expect(screen.getAllByText(item.label).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("renders exactly one primary CTA button (mainNavCta label)", () => {
    render(<Navbar />);

    // The CTA renders once in the always-visible right cluster. The mobile
    // drawer's CTA is not mounted until the Sheet is opened, so exactly one
    // instance is present in the initial render.
    const ctas = screen.getAllByRole("link", { name: mainNavCta.label });
    expect(ctas).toHaveLength(1);
  });
});

describe("MobileNav drawer rendering (Requirement 2.9)", () => {
  it("renders every mainNav label plus the CTA inside the drawer once opened", async () => {
    render(<MobileNav />);

    // Drawer content is portaled and not present before opening.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /open navigation menu/i }),
    );

    const dialog = await screen.findByRole("dialog");

    // Every nav label is present inside the drawer.
    for (const item of mainNav) {
      expect(within(dialog).getByText(item.label)).toBeInTheDocument();
    }

    // The CTA is present inside the drawer as a link.
    expect(
      within(dialog).getByRole("link", { name: mainNavCta.label }),
    ).toBeInTheDocument();
  });
});

describe("MobileNav closes after selection (Requirement 2.10)", () => {
  it("closes the drawer after selecting a navigation link", async () => {
    render(<MobileNav />);

    fireEvent.click(
      screen.getByRole("button", { name: /open navigation menu/i }),
    );

    const dialog = await screen.findByRole("dialog");

    // Select the first route link inside the drawer.
    const firstLink = within(dialog).getByRole("link", {
      name: mainNav[0].label,
    });
    fireEvent.click(firstLink);

    // The drawer closes: its dialog is removed from the document.
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes the drawer after selecting the CTA link", async () => {
    render(<MobileNav />);

    fireEvent.click(
      screen.getByRole("button", { name: /open navigation menu/i }),
    );

    const dialog = await screen.findByRole("dialog");

    fireEvent.click(
      within(dialog).getByRole("link", { name: mainNavCta.label }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
