/**
 * Unit tests for the Google Analytics wrapper (`lib/analytics.ts`).
 *
 * Covers the safety contract from Requirements 9.4 and 9.5:
 * - When the analytics global (`window.gtag`) is unavailable, the wrapper
 *   functions no-op and never throw (Requirement 9.4).
 * - During SSR/prerender (`window` undefined), the functions no-op and never
 *   throw (Requirement 9.5).
 * - When `window.gtag` is a callable function, page views and events are
 *   forwarded with the correct arguments (Requirements 9.2, 9.3).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  GA_MEASUREMENT_ID,
  trackEvent,
  trackPageView,
} from "@/lib/analytics";

afterEach(() => {
  vi.unstubAllGlobals();
  // Ensure no stray gtag leaks between tests.
  if (typeof window !== "undefined") {
    delete (window as { gtag?: unknown }).gtag;
  }
});

describe("analytics wrapper", () => {
  it("exposes the legacy measurement ID", () => {
    expect(GA_MEASUREMENT_ID).toBe("G-J5QG3LXERQ");
  });

  describe("when window.gtag is unavailable (Requirement 9.4)", () => {
    it("trackPageView does not throw and calls nothing", () => {
      // gtag is not defined on window.
      expect(() => trackPageView("/about")).not.toThrow();
    });

    it("trackEvent does not throw and calls nothing", () => {
      expect(() => trackEvent("cta_click", { label: "hero" })).not.toThrow();
    });

    it("does not forward when window.gtag is not a function", () => {
      // A non-callable value should be treated as unavailable.
      (window as { gtag?: unknown }).gtag = "not-a-function";
      expect(() => trackPageView("/contact")).not.toThrow();
      expect(() => trackEvent("submit")).not.toThrow();
    });
  });

  describe("during SSR / prerender (Requirement 9.5)", () => {
    it("trackPageView no-ops safely when window is undefined", () => {
      vi.stubGlobal("window", undefined);
      expect(typeof window).toBe("undefined");
      expect(() => trackPageView("/")).not.toThrow();
    });

    it("trackEvent no-ops safely when window is undefined", () => {
      vi.stubGlobal("window", undefined);
      expect(typeof window).toBe("undefined");
      expect(() => trackEvent("page_load")).not.toThrow();
    });
  });

  describe("when window.gtag is available (Requirements 9.2, 9.3)", () => {
    it("trackPageView forwards a config call with page_path", () => {
      const gtag = vi.fn();
      (window as { gtag?: unknown }).gtag = gtag;

      trackPageView("/our-product");

      expect(gtag).toHaveBeenCalledTimes(1);
      expect(gtag).toHaveBeenCalledWith("config", GA_MEASUREMENT_ID, {
        page_path: "/our-product",
      });
    });

    it("trackEvent forwards an event call with name and params", () => {
      const gtag = vi.fn();
      (window as { gtag?: unknown }).gtag = gtag;

      trackEvent("cta_click", { label: "hero", value: 1 });

      expect(gtag).toHaveBeenCalledTimes(1);
      expect(gtag).toHaveBeenCalledWith("event", "cta_click", {
        label: "hero",
        value: 1,
      });
    });

    it("trackEvent forwards an event with undefined params when none provided", () => {
      const gtag = vi.fn();
      (window as { gtag?: unknown }).gtag = gtag;

      trackEvent("page_view");

      expect(gtag).toHaveBeenCalledTimes(1);
      expect(gtag).toHaveBeenCalledWith("event", "page_view", undefined);
    });
  });
});
