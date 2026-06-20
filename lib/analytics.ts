/**
 * Google Analytics (gtag) wrapper.
 *
 * Preserves the existing measurement ID (G-J5QG3LXERQ) from the legacy site.
 * The GA script itself is loaded by the root layout; this module only forwards
 * page views and events to the analytics layer through the global `gtag`.
 *
 * Safety contract (Requirements 9.2–9.5):
 * - Every call guards on `typeof window !== "undefined" && typeof window.gtag === "function"`.
 * - During SSR/prerender (`window` undefined) the functions no-op and never throw.
 * - When the analytics global is unavailable (blocked, not yet loaded) the
 *   functions no-op and return without raising an error, so the rest of the
 *   app keeps rendering and responding to interaction.
 */

/** The Google Analytics measurement ID used across the site. */
export const GA_MEASUREMENT_ID = "G-J5QG3LXERQ";

/**
 * The `gtag` command function injected by the Google Analytics script.
 * It accepts a variadic argument list (e.g. `("config", id)`, `("event", name, params)`).
 */
type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

/**
 * Returns `true` only when running in a browser where the `gtag` global is a
 * callable function. Returns `false` during SSR/prerender or when GA is
 * unavailable, allowing callers to no-op safely.
 */
function isGtagAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

/**
 * Forward a page view to the analytics layer.
 *
 * No-ops (without throwing) during SSR/prerender and whenever `window.gtag`
 * is unavailable.
 *
 * @param url - The path/URL of the page being viewed.
 */
export function trackPageView(url: string): void {
  if (!isGtagAvailable()) {
    return;
  }

  window.gtag!("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

/**
 * Forward a custom event to the analytics layer.
 *
 * No-ops (without throwing) during SSR/prerender and whenever `window.gtag`
 * is unavailable.
 *
 * @param name - The event name.
 * @param params - Optional event parameters.
 */
export function trackEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  if (!isGtagAvailable()) {
    return;
  }

  window.gtag!("event", name, params);
}
