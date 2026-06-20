import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mainNavCta } from "@/lib/site-config";

/**
 * Conversion CTA band (Home Page Section Design item 6; Requirements 1.2, 1.3).
 *
 * A bold conversion section that sits just before the contact form. It uses a
 * tinted `--primary` panel with strong type and a single primary call-to-action
 * sourced from the shared `mainNavCta` (so the home page surfaces exactly one
 * "Request beta access" CTA, consistent with the navbar).
 *
 * Styling is token-only (no color literals): the `py-16 md:py-24` rhythm inside
 * the `max-w-7xl` container, a `--primary` panel with `--primary-foreground`
 * text and `rounded-xl` feature-panel radius, and a high-contrast CTA built from
 * {@link buttonVariants} as a `next/link` (the `secondary` variant reads as a
 * white button on the primary band). Entrance uses the reduced-motion-aware
 * {@link ScrollReveal} wrapper.
 */
export function CtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <ScrollReveal>
          <div className="rounded-xl bg-primary px-6 py-16 text-center shadow-md md:px-16 md:py-20">
            <h2 className="mx-auto max-w-3xl text-balance text-primary-foreground">
              Ready to bring AI-assisted diagnostics to your team?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
              Request beta access to Orasis AI and see how BioAnalytiX helps
              radiologists detect anomalies faster and with greater accuracy.
            </p>

            <div className="mt-10 flex justify-center">
              <Link
                href={mainNavCta.href}
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
              >
                {mainNavCta.label}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default CtaSection;
