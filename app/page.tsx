import type { Metadata } from "next";

import Hero from "@/components/hero";
import { Solutions } from "@/components/sections/solutions";
import { Impact } from "@/components/sections/impact";
import { ContactSection } from "@/components/sections/contact-section";
import { absoluteUrl, routeMetadata, siteConfig } from "@/lib/site-config";

/**
 * Per-route SEO metadata for the home page (Requirements 8.1, 8.2, 8.3).
 *
 * Derived from the shared `routeMetadata.home` config so the title (<= 60),
 * description (50–160), canonical, Open Graph, and Twitter card stay in sync
 * with the single source of truth. The canonical and Open Graph `url` are
 * resolved to absolute URLs rooted at `https://bioanalytix.info` via
 * {@link absoluteUrl}, and the single Open Graph image declares its 1200x630
 * dimensions. This page-level export merges over the layout default.
 */
const home = routeMetadata.home;

export const metadata: Metadata = {
  title: home.title,
  description: home.description,
  alternates: {
    canonical: absoluteUrl(home.path),
  },
  openGraph: {
    type: home.ogType,
    siteName: siteConfig.name,
    title: home.title,
    description: home.description,
    url: absoluteUrl(home.path),
    images: [{ url: home.ogImage, width: 1200, height: 630, alt: home.title }],
  },
  twitter: {
    card: home.twitterCard,
    title: home.title,
    description: home.description,
    images: [home.ogImage],
  },
};

/**
 * Home page.
 *
 * Composes the home-page sections in order. The root layout already provides
 * the Navbar and footer, so this page renders only its section content: the
 * split hero, the "AI solutions for impact" products section, the "Our impact"
 * stats / partner band, and the contact form (which carries the `#contact`
 * anchor referenced by the navbar and footer).
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Solutions />
      <Impact />
      <ContactSection />
    </>
  );
}
