"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Route-segment error boundary (`app/error.tsx`).
 *
 * Catches uncaught runtime errors thrown while rendering a route and shows a
 * branded fallback instead of a blank/broken page. It renders inside the root
 * layout, so the navbar and footer remain available. `reset()` re-attempts to
 * render the segment; a Home link is the safe escape hatch. Styling is
 * token-only, matching the 404 page.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for debugging / server logs; no PII is included.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center py-16 md:py-24">
      <div className="container">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p
            className="font-display text-6xl font-extrabold leading-none tracking-tight text-primary md:text-7xl"
            aria-hidden="true"
          >
            Oops
          </p>

          <h1 className="mt-6 text-foreground">Something went wrong</h1>

          <p className="mt-4 text-lg leading-relaxed text-muted">
            An unexpected error occurred. You can try again, or head back to the
            home page.
          </p>

          {error.digest ? (
            <p className="mt-2 text-xs text-muted">Reference: {error.digest}</p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              <RotateCcw className="size-4" strokeWidth={2} aria-hidden="true" />
              Try again
            </button>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              <Home className="size-4" strokeWidth={2} aria-hidden="true" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
