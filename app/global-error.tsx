"use client";

import { useEffect } from "react";

import "./globals.css";

/**
 * Global error boundary (`app/global-error.tsx`).
 *
 * The last line of defense: it catches errors thrown in the root layout itself,
 * which `app/error.tsx` cannot handle. Because it replaces the entire document,
 * it must render its own `<html>`/`<body>`. We import `globals.css` so the
 * design tokens and base styles are available even when the layout failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen items-center justify-center px-6 py-16">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <p
              className="text-6xl font-extrabold leading-none tracking-tight text-primary md:text-7xl"
              aria-hidden="true"
            >
              Oops
            </p>

            <h1 className="mt-6 text-2xl font-bold tracking-[-0.02em] text-foreground md:text-3xl">
              Something went wrong
            </h1>

            <p className="mt-4 text-base leading-relaxed text-muted">
              A critical error occurred while loading the page. Please try again
              or return to the home page.
            </p>

            {error.digest ? (
              <p className="mt-2 text-xs text-muted">Reference: {error.digest}</p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary-hover"
              >
                Try again
              </button>
              <a
                href="/"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-8 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface"
              >
                Back to home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
