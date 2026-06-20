import Image from "next/image";

import { ScrollReveal } from "@/components/motion/scroll-reveal";

/**
 * Trust bar — a low-key credibility strip directly under the hero
 * (Home Page Section Design item 2; Requirements 1.2, 1.3).
 *
 * Renders partner / institution / press logos in muted monochrome on the
 * `--surface` canvas. Per the design, the strip is rendered ONLY when logo
 * assets exist; when the `trustLogos` source is empty (the brand SVGs are
 * migrated into `public/images` in task 11) the component renders nothing so
 * the home page never shows an empty "trusted by" band.
 *
 * Styling uses design tokens exclusively (no color literals): a `--surface`
 * background with `--border` hairlines, `--muted` label text, and the standard
 * `py-16 md:py-24` section rhythm inside the `max-w-7xl` container. Logos are
 * desaturated and dimmed so they read as a calm, clinical credibility cue
 * rather than competing with the hero.
 */

/** A single trust/partner logo asset. */
export interface TrustLogo {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Logo assets shown in the trust strip. Empty until the brand/partner SVGs are
 * migrated into `public/images` (task 11); while empty the section is omitted.
 * Paths reference `/images/...` placeholders to be wired up during migration.
 */
export const trustLogos: TrustLogo[] = [];

export function TrustBar() {
  // Guard: render only when logo assets exist; otherwise omit the section.
  if (trustLogos.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Trusted by"
      className="border-y border-border bg-surface py-16 md:py-24"
    >
      <div className="container">
        <ScrollReveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            Trusted by leading institutions
          </p>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {trustLogos.map((logo) => (
              <li key={logo.src} className="flex items-center">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  sizes="(max-width: 768px) 40vw, 160px"
                  className="h-8 w-auto opacity-60 grayscale transition-opacity duration-200 hover:opacity-100"
                />
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default TrustBar;
