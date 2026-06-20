import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

import {
  footerNav,
  legalNav,
  siteConfig,
  type NavItem,
} from "@/lib/site-config";
import { CookieSettingsButton } from "@/components/cookie-settings-button";

// Inline SVG brand icons (lucide-react dropped brand icons in v1+)
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  LinkedIn: LinkedInIcon,
  Instagram: InstagramIcon,
};

/**
 * Site footer — footer16 layout.
 *
 * Dark/black background with a giant watermark brand name behind the content,
 * nav columns on the right, logo + social icons on the left, and a baseline
 * row with copyright + legal links.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border bg-background text-foreground">
      {/* ── Watermark ──────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-16 flex justify-center select-none overflow-hidden leading-none"
      >
        <span className="whitespace-nowrap text-[clamp(5rem,18vw,14rem)] font-black tracking-tight text-foreground/[0.04]">
          {siteConfig.name}
        </span>
      </div>

      <div className="container relative z-10 py-14">
        {/* ── Top row: logo left, nav columns right ──────────────────────── */}
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          {/* Brand block */}
          <div className="flex flex-col gap-6">
            <Link
              href="/"
              aria-label={`${siteConfig.name} home`}
              className="inline-flex w-fit items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-3"
            >
              <Image
                src="/images/bioanalytix-mark.svg"
                alt=""
                aria-hidden="true"
                width={124}
                height={112}
                sizes="56px"
                priority={false}
                className="h-12 w-auto"
              />
              <span className="flex flex-col items-start justify-center leading-none">
                <Image
                  src={siteConfig.bannerSrc}
                  alt={siteConfig.name}
                  width={160}
                  height={36}
                  sizes="160px"
                  priority={false}
                  className="h-8 w-auto brightness-0"
                />
                <span className="mt-1 pl-1.5 text-xs italic text-muted-foreground sm:pl-2 sm:text-sm">
                  {siteConfig.tagline}
                </span>
              </span>
            </Link>

            {/* Social icons */}
            {siteConfig.social.length > 0 && (
              <ul className="flex items-center gap-3">
                {siteConfig.social.map((item) => {
                  const Icon = SOCIAL_ICONS[item.label];
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {Icon ? (
                          <Icon className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-medium">
                            {item.label.slice(0, 2)}
                          </span>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Nav columns */}
          <div className="flex flex-wrap gap-x-16 gap-y-10">
            {footerNav.map((group) => (
              <nav
                key={group.heading}
                aria-label={group.heading}
                className="flex flex-col gap-4"
              >
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.heading}
                </h2>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={`${group.heading}-${item.href}`}>
                      <FooterLink item={item} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            {/* Contact column */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Contact
              </h2>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:info@bioanalytix.info"
                    className="inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    info@bioanalytix.info
                  </a>
                </li>
                <li className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Thessaloniki, Greece
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Baseline row: copyright + legal + cookie settings ──────────── */}
        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalNav.map((item) => (
              <FooterLink key={item.href} item={item} />
            ))}
            <CookieSettingsButton className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" />
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * A single footer link — muted by default, shifts to foreground on hover/focus.
 */
function FooterLink({ item }: { item: NavItem }) {
  const className =
    "text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm";

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {item.label}
    </Link>
  );
}

export default SiteFooter;
