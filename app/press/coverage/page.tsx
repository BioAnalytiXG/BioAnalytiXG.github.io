import type { Metadata } from "next";

import { PressListing } from "@/components/press/press-listing";
import { getCoverageItems } from "@/lib/press";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

/**
 * Press coverage (`/press/coverage`).
 *
 * The filterable list of external media coverage about BioAnalytiX — each card
 * opens the outlet's article in a new tab. Reached from the "View all coverage"
 * action on the press landing.
 */
export const metadata: Metadata = {
  title: "Press Coverage",
  description:
    "Articles, interviews, and features about BioAnalytiX and our work in AI for healthcare and education — filterable by category, type, and date.",
  alternates: { canonical: absoluteUrl("/press/coverage") },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "Press Coverage",
    description:
      "Articles, interviews, and features about BioAnalytiX and our work in AI for healthcare and education.",
    url: absoluteUrl("/press/coverage"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Press Coverage",
    description:
      "Articles, interviews, and features about BioAnalytiX and our work in AI.",
  },
};

export default function PressCoveragePage() {
  return (
    <PressListing
      crumb="Coverage"
      eyebrow="Press coverage"
      titleLead="All press"
      titleAccent="coverage."
      subtitle="Articles, interviews, and features about BioAnalytiX and our work in AI for healthcare and education."
      items={getCoverageItems()}
      emptyLabel="No coverage matches your filters."
    />
  );
}
