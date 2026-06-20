"use client";

import * as React from "react";
import Link from "next/link";
import Script from "next/script";
import { Cookie } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";

/** localStorage key holding the visitor's analytics choice. */
const CONSENT_KEY = "ba-cookie-consent";
/** Custom event other UI (e.g. a footer link) dispatches to re-open the banner. */
export const COOKIE_SETTINGS_EVENT = "ba:cookie-settings";

type Consent = "granted" | "denied";

/**
 * Cookie consent + Google Analytics gating (GDPR / ePrivacy).
 *
 * Google Analytics is NOT loaded — and no analytics cookies are set — until the
 * visitor explicitly accepts. The choice is stored in `localStorage` so it
 * persists across visits, and it can be changed at any time (the footer
 * "Cookie settings" control dispatches {@link COOKIE_SETTINGS_EVENT} to reopen
 * the banner). Declining keeps GA unloaded and clears any GA cookies.
 */
export function CookieConsent() {
  const [consent, setConsent] = React.useState<Consent | null>(null);
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(CONSENT_KEY);
    } catch {
      /* storage unavailable — show the banner */
    }
    if (stored === "granted" || stored === "denied") {
      setConsent(stored);
    } else {
      setOpen(true);
    }

    const reopen = () => setOpen(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  const choose = (value: Consent) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* ignore */
    }
    setConsent(value);
    setOpen(false);
    if (value === "denied") clearGaCookies();
  };

  // Avoid hydration mismatch: render nothing until mounted + storage is read.
  if (!mounted) return null;

  return (
    <>
      {consent === "granted" ? <GaScripts /> : null}
      {open ? (
        <ConsentBanner
          onAccept={() => choose("granted")}
          onDecline={() => choose("denied")}
        />
      ) : null}
    </>
  );
}

/** Loads GA only when consent is granted, with IP anonymization and no ad signals. */
function GaScripts() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-gtag-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'granted'
          });
          gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}

/** Remove GA cookies when consent is declined/withdrawn. */
function clearGaCookies() {
  if (typeof document === "undefined") return;
  const expired = "Thu, 01 Jan 1970 00:00:00 GMT";
  const host = window.location.hostname;
  const domains = [host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const raw of document.cookie.split(";")) {
    const name = raw.split("=")[0]?.trim() ?? "";
    if (name.startsWith("_ga") || name === "_gid" || name === "_gat") {
      document.cookie = `${name}=; expires=${expired}; path=/`;
      for (const d of domains) {
        document.cookie = `${name}=; expires=${expired}; path=/; domain=${d}`;
      }
    }
  }
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", { analytics_storage: "denied" });
  }
}

function ConsentBanner({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-2xl rounded-2xl border border-border bg-background/95 p-5 shadow-lg backdrop-blur-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span
          aria-hidden
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <Cookie className="size-5" />
        </span>
        <p className="flex-1 text-sm leading-relaxed text-muted">
          We use cookies to understand site usage and improve your experience.
          Analytics cookies are only set with your consent. Read our{" "}
          <Link
            href="/privacy-policy"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="rounded-full" onClick={onDecline}>
            Decline
          </Button>
          <Button size="sm" className="rounded-full" onClick={onAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
