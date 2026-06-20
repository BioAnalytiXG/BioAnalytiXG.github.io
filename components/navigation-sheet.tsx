"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { mainNav, mainNavCta, siteConfig } from "@/lib/site-config";

/**
 * Mobile navigation drawer.
 *
 * Drops down from just below the floating pill navbar (no duplicated logo or
 * close button — the pill stays visible above it) as a panel that visually
 * extends the pill: same insets, rounded corners, translucent blurred surface,
 * border, and shadow. It lists the primary nav links (with Products sub-items
 * nested), a divider, and full-width pill CTAs that echo the navbar buttons — a
 * primary "Contact Us" plus, on the Gnosis AI route only, the "Request beta
 * access" CTA. The trigger is an animated hamburger that morphs into an X while
 * open and toggles the panel closed. Every link is wrapped in `SheetClose` so a
 * tap navigates and dismisses the panel in one gesture.
 */
export const NavigationSheet = () => {
  const pathname = usePathname();
  // The beta program is exclusive to Gnosis AI (matches the desktop navbar).
  const showBetaCta = pathname?.startsWith("/gnosis-ai") ?? false;

  return (
    <Sheet>
      <VisuallyHidden>
        <SheetTitle>Navigation menu</SheetTitle>
      </VisuallyHidden>

      {/* Trigger: hamburger that morphs into an X while open. */}
      <SheetTrigger
        className="group relative inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Toggle menu"
      >
        <span className="sr-only">Toggle menu</span>
        <span
          aria-hidden="true"
          className="absolute h-0.5 w-5 -translate-y-[5px] rounded-full bg-current transition-transform duration-300 ease-in-out group-data-[state=open]:translate-y-0 group-data-[state=open]:rotate-45"
        />
        <span
          aria-hidden="true"
          className="absolute h-0.5 w-5 rounded-full bg-current transition-all duration-200 ease-in-out group-data-[state=open]:scale-x-0 group-data-[state=open]:opacity-0"
        />
        <span
          aria-hidden="true"
          className="absolute h-0.5 w-5 translate-y-[5px] rounded-full bg-current transition-transform duration-300 ease-in-out group-data-[state=open]:translate-y-0 group-data-[state=open]:-rotate-45"
        />
      </SheetTrigger>

      <SheetContent
        side="top"
        overlayClassName="bg-transparent backdrop-blur-none"
        className="inset-x-4 top-[5.25rem] flex max-h-[calc(100vh-7rem)] flex-col gap-0 overflow-hidden rounded-3xl border bg-background/95 p-0 shadow-lg backdrop-blur-sm sm:inset-x-6 sm:top-[7.25rem] [&>button]:hidden"
      >
        {/* Primary links */}
        <nav className="flex-1 overflow-y-auto px-5 pb-2 pt-5 sm:px-6" aria-label="Mobile">
          <ul className="space-y-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <SheetClose asChild>
                  <Link
                    href={item.href}
                    className="block rounded-md py-3 text-xl font-semibold tracking-[-0.01em] text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {item.label}
                  </Link>
                </SheetClose>

                {item.children && item.children.length > 0 ? (
                  <ul className="mb-1 ml-1 space-y-0.5 border-l border-border pl-4">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <SheetClose asChild>
                          <Link
                            href={child.href}
                            target={child.external ? "_blank" : undefined}
                            rel={
                              child.external ? "noopener noreferrer" : undefined
                            }
                            className="block rounded-md py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {child.label}
                          </Link>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        {/* Divider + pill CTAs */}
        <div className="space-y-3 border-t border-border px-5 py-6 sm:px-6">
          {showBetaCta ? (
            <SheetClose asChild>
              <PillCta href={mainNavCta.href} variant="primary">
                {mainNavCta.label}
              </PillCta>
            </SheetClose>
          ) : null}

          <SheetClose asChild>
            <PillCta
              href="/#contact"
              variant={showBetaCta ? "secondary" : "primary"}
            >
              Contact Us
            </PillCta>
          </SheetClose>

          {/* Social links */}
          {siteConfig.social.length > 0 ? (
            <div className="flex items-center justify-center gap-6 pt-2">
              {siteConfig.social.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {social.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};

/**
 * Full-width rounded pill CTA with a trailing arrow-in-circle, matching the
 * mobile menu reference. `primary` uses the brand accent; `secondary` uses the
 * soft brand tint. Forwards the ref/props so it works as a `SheetClose` child.
 */
const PillCta = ({
  href,
  variant = "primary",
  children,
  ...props
}: {
  href: string;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof Link>) => {
  const isPrimary = variant === "primary";
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-full py-3 pl-6 pr-2.5 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isPrimary
          ? "bg-primary text-primary-foreground hover:bg-primary-hover"
          : "bg-brand-soft text-brand-ink hover:bg-brand-soft/80",
      )}
      {...props}
    >
      <span className="flex-1 text-center">{children}</span>
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-foreground">
        <ArrowUpRight className="size-4" />
      </span>
    </Link>
  );
};
