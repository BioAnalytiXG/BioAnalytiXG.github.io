import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * About / mission section (Home Page Section Design item 4; Requirements 1.2,
 * 1.3).
 *
 * Presents the BioAnalytiX radiology / Orasis AI mission in a two-column layout
 * — supporting copy on one side, a framed product/illustration image on the
 * other — with the generous whitespace the Visual Design Language calls for.
 *
 * Styling is token-only (no color literals): the standard `py-16 md:py-24`
 * rhythm inside the `max-w-7xl` container, an `overline` eyebrow in `--primary`,
 * a bold `h2`, `--muted` body copy, and a framed image (`rounded-lg`, `--border`
 * hairline, `shadow-md`) sitting on `--surface`. Entrance uses the shared,
 * reduced-motion-aware {@link ScrollReveal} wrapper.
 */

/** Mission highlights paired with the narrative copy. */
const missionPoints = [
  "AI that augments human expertise — never replaces it.",
  "Faster, more accurate decisions across healthcare and education.",
  "Built for real-world workflows and teams of every size.",
] as const;

export function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24">
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy column */}
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Our mission
            </p>
            <h2 className="mt-4 text-foreground">
              Building AI that makes healthcare and education smarter
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              BioAnalytiX builds AI that gives professionals the clarity to act
              with confidence — whether that means faster, more accurate
              decisions in a clinical setting or deeper, more effective learning
              in the classroom. Our products are built around the people who use
              them.
            </p>

            <ul className="mt-8 space-y-4">
              {missionPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-primary"
                  />
                  <span className="text-base text-foreground">{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Link
                href="/about"
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
              >
                Learn about our story
              </Link>
            </div>
          </ScrollReveal>

          {/* Framed image column */}
          <ScrollReveal delay={120}>
            <div className="rounded-xl border border-border bg-surface p-2 shadow-md">
              <div className="overflow-hidden rounded-lg border border-border">
                <Image
                  src="/images/orasis-ai-preview.png"
                  alt="Orasis AI analyzing a brain CT scan within the BioAnalytiX diagnostic workspace"
                  width={960}
                  height={720}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
