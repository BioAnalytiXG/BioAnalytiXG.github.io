import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site-config";

/**
 * Web app manifest (served at /manifest.webmanifest).
 *
 * Provides install metadata and icons for browsers/PWA surfaces. The theme
 * color matches the brand mint (`--primary`, #7CCDB3) used in the viewport
 * theme-color. Icons are the rasterized hex brand mark.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7CCDB3",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
