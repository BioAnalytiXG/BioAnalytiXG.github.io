"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  mainNav,
  mainNavCta,
  siteConfig,
  type NavCta,
  type NavItem,
} from "@/lib/site-config";

interface MobileNavProps {
  items?: NavItem[];
  cta?: NavCta;
}

/** A nav href split into its hosting route path and optional in-page anchor. */
interface ParsedHref {
  /** Route that hosts the link, or `null` for a bare "#anchor" (current page). */
  path: string | null;
  /** In-page anchor id (without the leading "#"), or `null` for a route link. */
  hash: string | null;
}

/** Split a NavItem href into its `{ path, hash }` parts (mirrors the Navbar). */
function parseHref(href: string): ParsedHref {
  if (href.startsWith("#")) {
    return { path: null, hash: href.slice(1) || null };
  }
  const [path, hash] = href.split("#");
  return { path: path || "/", hash: hash || null };
}

/**
 * Mobile navigation drawer.
 *
 * Below the `md` breakpoint the Navbar's horizontal links are hidden and this
 * hamburger-triggered shadcn `Sheet` takes over (Requirement 2.9). The trigger
 * lives in the bar alongside the always-visible logo and primary CTA; the whole
 * component is `md:hidden` so it never appears on desktop. Selecting any link
 * performs its in-page scroll (reduced-motion-aware) or route navigation and
 * then closes the drawer (Requirement 2.10).
 */
export function MobileNav({
  items = mainNav,
  cta = mainNavCta,
}: MobileNavProps) {
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      const parsed = parseHref(href);

      // In-page anchor hosted by the current route: smooth-scroll (instant
      // under reduced motion) instead of a full navigation (Requirement 2.4/2.5).
      if (parsed.hash !== null) {
        const hostPath = parsed.path ?? pathname;
        if (hostPath === pathname) {
          const target = document.getElementById(parsed.hash);
          if (target) {
            event.preventDefault();
            target.scrollIntoView({
              behavior: prefersReducedMotion ? "auto" : "smooth",
              block: "start",
            });
            if (typeof window !== "undefined") {
              window.history.replaceState(null, "", `#${parsed.hash}`);
            }
          }
        }
      }

      // Either way, close the drawer once the link has acted (Requirement 2.10).
      // Route links keep their default `next/link` navigation; closing the Sheet
      // after the click does not cancel it.
      setOpen(false);
    },
    [pathname, prefersReducedMotion],
  );

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="Open navigation menu"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-9 w-9",
          )}
        >
          <Menu className="size-5" />
        </SheetTrigger>

        <SheetContent
          side="right"
          className="flex w-3/4 flex-col gap-6 sm:max-w-sm"
        >
          <SheetHeader>
            <SheetTitle className="text-left">{siteConfig.name}</SheetTitle>
          </SheetHeader>

          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {items.map((item) =>
              item.children && item.children.length > 0 ? (
                <div key={item.href} className="flex flex-col">
                  <span className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                    {item.label}
                  </span>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={(event) => handleSelect(event, child.href)}
                      className="rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(event) => handleSelect(event, item.href)}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <Link
            href={cta.href}
            onClick={(event) => handleSelect(event, cta.href)}
            className={cn(buttonVariants({ variant: "default" }), "mt-2 w-full")}
          >
            {cta.label}
          </Link>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNav;
