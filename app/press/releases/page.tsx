import type { Metadata } from "next";

import { PressListing } from "@/components/press/press-listing";
import { getReleaseItems } from "@/lib/press";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

/**
 * Press releases (`/press/releases`).
 *
 * The filterable list of BioAnalytiX's own announcements — each card opens the
 * full release on its own page. Reached from the "View all press releases"
 * action on the press landing.
 */
export const metadata: Metadata = {
  title: "Press Releases",
  description:
    "Browse every BioAnalytiX press release — partnerships, awards, funding, and milestones — filterable by category, type, and date.",
  alternates: { canonical: absoluteUrl("/press/releases") },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "Press Releases",
    description:
      "Browse every BioAnalytiX press release — partnerships, awards, funding, and milestones.",
    url: absoluteUrl("/press/releases"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Press Releases",
    description:
      "Browse every BioAnalytiX press release — partnerships, awards, funding, and milestones.",
  },
};

export default function PressReleasesPage() {
  return (
    <PressListing
      crumb="Press releases"
      eyebrow="Press releases"
      titleLead="All press"
      titleAccent="releases."
      subtitle="Announcements, partnerships, awards, and milestones from our work bringing AI into healthcare and education."
      items={getReleaseItems()}
      emptyLabel="No releases match your filters."
    />
  );
}
