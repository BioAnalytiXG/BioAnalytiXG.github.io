import Link from "next/link";
import type { Metadata } from "next";
import { Home } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { routeMetadata } from "@/lib/site-config";

/**
 * `noindex` metadata for the 404 page (Requirement 8.5). The catch-all route
 * is excluded from search indexing (`robots: index/follow false`) and is
 * omitted from the sitemap by the shared `indexableRouteKeys` filter.
 */
export const metadata: Metadata = {
  title: routeMetadata.notFound.title,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Branded catch-all 404 page (`app/not-found.tsx`) — Requirement 1.6.
 *
 * Rendered by the App Router for any path that matches no defined route. It
 * renders inside the root layout (the shared Navbar and footer are already
 * mounted there), so this component only supplies the centered 404 content:
 * a bold `display`-scale "404", a heading + lead message, and a single primary
 * CTA that returns the visitor to the home page ("/").
 *
 * Styling is token-only per the Visual Design Language — no hex/rgb literals.
 * Color comes from `--foreground` / `--muted` / `--primary` tokens, the layout
 * uses the standard `container` plus the `py-24 / py-16` section rhythm, and
 * the home control reuses the shared `buttonVariants` so it themes
 * automatically. The lucide `Home` icon is a tasteful accent.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center py-16 md:py-24">
      <div className="container">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p
            className="font-display text-7xl font-extrabold leading-none tracking-tight text-primary md:text-8xl"
            aria-hidden="true"
          >
            404
          </p>

          <h1 className="mt-6 text-foreground">Page not found</h1>

          <p className="mt-4 text-lg leading-relaxed text-muted">
            The page you&rsquo;re looking for doesn&rsquo;t exist or may have
            moved. Let&rsquo;s get you back on track.
          </p>

          <Link
            href="/"
            className={buttonVariants({ variant: "default", size: "lg", className: "mt-8" })}
          >
            <Home className="size-4" strokeWidth={2} aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
