import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

import PillNavbar from "@/components/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { CookieConsent } from "@/components/cookie-consent";
import { DEFAULT_OG_IMAGE, SITE_URL, siteConfig } from "@/lib/site-config";

import "./globals.css";

/**
 * Manrope is self-hosted through the Next.js font pipeline: `next/font/google`
 * downloads and serves the font files from the same origin at build time, so
 * there are no render-blocking requests to third-party font hosts (Req 13.1).
 *
 * `display: "swap"` renders text immediately with the fallback stack and swaps
 * in Manrope once loaded, avoiding any invisible-text period (Req 13.2). The
 * single Manrope instance is exposed twice — as `--font-display` and
 * `--font-sans` — so the design system can evolve a distinct display face later
 * without touching components (Req 13.3). `fallback` defines the sans-serif
 * stack used if a font file fails to load (Req 13.6).
 */
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

const manropeDisplay = Manrope({
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
  variable: "--font-display",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

/**
 * Default, site-wide SEO metadata (Requirement 8.1).
 *
 * `metadataBase` roots every relative canonical/OG/Twitter URL at the
 * production origin so social/preview crawlers resolve absolute links. The
 * title `template` applies `siteConfig.titleTemplate` ("%s | BioAnalytiX") to
 * per-route titles, while `default` covers routes that do not set their own.
 * Open Graph (`website`) and the `summary_large_image` Twitter card provide the
 * baseline share presentation that per-route metadata can override.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteConfig.name,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: SITE_URL,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [DEFAULT_OG_IMAGE],
  },
};

/**
 * Viewport + theme color. The browser UI (mobile address bar, PWA splash) tints
 * to the brand mint (`--primary`, #7CCDB3); the site is light-first.
 */
export const viewport: Viewport = {
  themeColor: "#7CCDB3",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${manropeDisplay.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <PillNavbar />
        <main id="main-content" className="pt-28 sm:pt-32">{children}</main>
        <SiteFooter />

        {/*
          Google Analytics is consent-gated: it loads only after the visitor
          accepts analytics cookies via the banner (Requirement 9.1 preserved,
          GDPR/ePrivacy compliant). See components/cookie-consent.tsx.
        */}
        <CookieConsent />
      </body>
    </html>
  );
}
