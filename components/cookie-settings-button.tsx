"use client";

import { COOKIE_SETTINGS_EVENT } from "@/components/cookie-consent";

/**
 * Re-opens the cookie consent banner so visitors can change or withdraw their
 * analytics choice at any time (GDPR right to withdraw). Place anywhere (e.g.
 * the footer); it simply dispatches the event the consent component listens for.
 */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
    >
      Cookie settings
    </button>
  );
}

export default CookieSettingsButton;
