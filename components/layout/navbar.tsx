"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useActiveSection } from "@/hooks/use-active-section";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  mainNav,
  mainNavCta,
  siteConfig,
  type NavCta,
  type NavItem,
} from "@/lib/site-config";

/**
 * Scroll distance (px) from the top of the document at which the navbar
 * switches from its transparent state to the translucent backdrop-blur bar
 * (Requirements 2.2, 2.3).
 */
const SCROLL_THRESHOLD_PX = 8;

interface NavbarProps {
  items?: NavItem[];
  cta?: NavCta;
  logoSrc?: string;
}

/** A nav href split into its hosting route path and optional in-page anchor. */
interface ParsedHref {
  /** Route that hosts the link, or `null` for a bare "#anchor" (current page). */
  path: string | null;
  /** In-page anchor id (without the leading "#"), or `null` for a route link. */
  hash: string | null;
}

/** Split a NavItem href into its `{ path, hash }` parts. */
function parseHref(href: string): ParsedHref {
  if (href.startsWith("#")) {
    return { path: null, hash: href.slice(1) || null };
  }
  const [path, hash] = href.split("#");
  return { path: path || "/", hash: hash || null };
}

/**
 * Sticky top navigation bar.
 *
 * Renders the logo, the horizontal nav links, and exactly one primary CTA from
 * the single `mainNav` / `mainNavCta` source (Requirement 2.1). It is
 * transparent within 8px of the top and becomes a translucent backdrop-blur bar
 * with a 1px bottom border once scrolled (Requirements 2.2, 2.3). In-page
 * anchors smooth-scroll (instant under reduced motion) (Requirements 2.4, 2.5);
 * a link whose anchor is absent on the current page falls through to its
 * hosting route (Requirement 2.6); standalone routes navigate via `next/link`
 * (Requirement 2.7). Exactly one link shows a `--primary` active indicator
 * resolved from `useActiveSection` plus the current route (Requirement 2.8).
 *
 * NOTE (task 5.2 integration point): below the `md` breakpoint the horizontal
 * links are hidden and the `MobileNav` Sheet drawer will mount in the marked
 * slot; the logo and CTA stay visible here per Requirement 2.9.
 */
export function Navbar({
  items = mainNav,
  cta = mainNavCta,
  logoSrc = siteConfig.bannerSrc,
}: NavbarProps) {
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position to toggle the translucent/blur treatment.
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Pre-parse hrefs once per items change.
  const parsedItems = useMemo(
    () => items.map((item) => ({ item, parsed: parseHref(item.href) })),
    [items],
  );

  // In-page anchors hosted by the *current* route are the scroll-spy targets.
  const sectionIds = useMemo(
    () =>
      parsedItems
        .filter(
          ({ parsed }) =>
            parsed.hash !== null && (parsed.path ?? pathname) === pathname,
        )
        .map(({ parsed }) => parsed.hash as string),
    [parsedItems, pathname],
  );

  const activeSection = useActiveSection(sectionIds);

  // Resolve exactly one active href (Requirement 2.8). An intersecting in-page
  // section wins; otherwise the route link whose path matches the current
  // pathname (and which has no anchor) is active.
  const activeHref = useMemo(() => {
    if (activeSection) {
      const match = parsedItems.find(
        ({ parsed }) =>
          parsed.hash === activeSection &&
          (parsed.path ?? pathname) === pathname,
      );
      if (match) return match.item.href;
    }
    const routeMatch = parsedItems.find(
      ({ parsed }) => parsed.hash === null && parsed.path === pathname,
    );
    return routeMatch?.item.href ?? null;
  }, [activeSection, parsedItems, pathname]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, parsed: ParsedHref) => {
      // Only intercept in-page anchors; route links use default Link navigation.
      if (parsed.hash === null) return;

      const hostPath = parsed.path ?? pathname;
      // Different hosting route: let Link navigate there (Requirement 2.6/2.7).
      if (hostPath !== pathname) return;

      const target = document.getElementById(parsed.hash);
      // Anchor absent on this page: fall through to the hosting route nav.
      if (!target) return;

      // Same-page anchor that exists: smooth-scroll (instant under reduced
      // motion) and reflect the hash in the URL (Requirements 2.4, 2.5).
      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `#${parsed.hash}`);
      }
    },
    [pathname, prefersReducedMotion],
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-200",
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="container flex h-16 items-center justify-between gap-6"
      >
        {/* Logo (left) */}
        <Link
          href="/"
          aria-label={`${siteConfig.name} home`}
          className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Image
            src={logoSrc}
            alt={siteConfig.name}
            width={240}
            height={48}
            sizes="240px"
            priority
            className="h-12 w-auto brightness-0"
          />
        </Link>

        {/* Horizontal nav links (center/right) — hidden below md (task 5.2) */}
        <ul className="hidden items-center gap-1 md:flex">
          {parsedItems.map(({ item, parsed }) => {
            const isActive = item.href === activeHref;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={(event) => handleClick(event, parsed)}
                  aria-current={isActive ? "page" : undefined}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium transition-colors rounded-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      ? "text-primary after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right cluster: single primary CTA (always visible) + mobile slot */}
        <div className="flex items-center gap-2">
          <Link
            href={cta.href}
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            {cta.label}
          </Link>

          {/*
            Task 5.2 integration point: the MobileNav hamburger + shadcn Sheet
            drawer. It is `md:hidden`, so it appears only below the md breakpoint
            while the logo and this CTA stay visible (Requirement 2.9).
          */}
          <MobileNav items={items} cta={cta} />
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
