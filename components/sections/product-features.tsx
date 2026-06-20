import {
  Brain,
  Plug,
  BarChart3,
  LayoutDashboard,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

/**
 * A single product feature entry.
 *
 * `icon` is a `lucide-react` icon name (replacing the legacy FontAwesome
 * glyphs). It is resolved to a concrete icon component through {@link ICONS};
 * any unknown name falls back to a neutral default so the grid never crashes on
 * bad data.
 */
export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface ProductFeaturesProps {
  /**
   * Feature entries to render. The home page renders exactly six (Requirement
   * 1.4); when omitted, the built-in {@link DEFAULT_FEATURES} set is used so the
   * section can be dropped in without props.
   */
  features?: Feature[];
  className?: string;
}

/**
 * Curated lucide icon set referenced by the default features. Every name used
 * by {@link DEFAULT_FEATURES} is present here, and the map doubles as the
 * lookup for any caller-supplied `icon` string. All names are verified against
 * the installed `lucide-react` exports.
 */
const ICONS: Record<string, LucideIcon> = {
  Brain,
  Plug,
  BarChart3,
  LayoutDashboard,
  ShieldCheck,
  RefreshCw,
};

/** Neutral fallback when a feature references an icon name we do not ship. */
const FALLBACK_ICON: LucideIcon = Sparkles;

/**
 * The six home-page product features (Requirement 1.4), preserving the legacy
 * site's feature copy. Provided as a default so the section renders without
 * props, while callers may still pass their own `features`.
 */
export const DEFAULT_FEATURES: Feature[] = [
  {
    icon: "Brain",
    title: "AI-Powered Diagnostics",
    description:
      "Advanced machine-learning models surface findings in radiology workflows, helping clinicians reach faster, more confident reads.",
  },
  {
    icon: "Plug",
    title: "Seamless Integration",
    description:
      "Drops into existing PACS and reporting pipelines with standards-based interfaces, so teams adopt it without disrupting their stack.",
  },
  {
    icon: "BarChart3",
    title: "Data-Driven Insights",
    description:
      "Turns imaging and reporting data into actionable analytics that reveal trends, bottlenecks, and opportunities to improve care.",
  },
  {
    icon: "LayoutDashboard",
    title: "User-Friendly Design",
    description:
      "A clean, focused interface keeps the relevant information one glance away, designed around how radiologists actually work.",
  },
  {
    icon: "ShieldCheck",
    title: "Clinical Validation",
    description:
      "Built and evaluated against rigorous clinical benchmarks, with a validation process that prioritizes safety and trust.",
  },
  {
    icon: "RefreshCw",
    title: "Continuous Improvement",
    description:
      "Models and workflows are refined continuously from real-world feedback, so the platform gets sharper over time.",
  },
];

/**
 * Bento column spans applied at the `lg` breakpoint. For exactly six cards the
 * pattern `[2,1,2,1,1,2]` tiles a three-column grid into three even rows with
 * no gaps, giving the mixed-cell-size "bento" look the design calls for while
 * the smaller breakpoints fall back to an even `1 / 2 / 3` column layout.
 */
const BENTO_LG_SPANS = [
  "lg:col-span-2",
  "lg:col-span-1",
  "lg:col-span-2",
  "lg:col-span-1",
  "lg:col-span-1",
  "lg:col-span-2",
] as const;

/** Per-card stagger step (ms) for the scroll-reveal cascade. */
const STAGGER_STEP_MS = 80;

/**
 * Product features section (Requirements 1.3, 1.4).
 *
 * Renders the feature cards as polished SaaS cards per the Visual Design
 * Language: a white (`--card`) surface, hairline `--border`, resting
 * `shadow-sm`, `rounded-lg`, a `lucide` icon in a soft `bg-primary/10` tile, a
 * bold `h3` title, and `--muted` body copy. On hover each card lifts (border
 * tints toward `--primary`, `shadow-md`, a subtle `-translate-y-0.5`). The grid
 * is a responsive bento — `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with
 * `gap-8`, mixed cell sizes on `lg` — and each card reveals on scroll with a
 * small per-item stagger via {@link ScrollReveal} (which itself renders the
 * static final frame under `prefers-reduced-motion`).
 *
 * Only design tokens (Tailwind classes mapped to CSS variables) are used; there
 * are no hard-coded color literals.
 */
export function ProductFeatures({
  features = DEFAULT_FEATURES,
  className,
}: ProductFeaturesProps) {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className={cn("bg-background py-16 md:py-24", className)}
    >
      <div className="container">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-primary">
            Platform
          </p>
          <h2
            id="features-heading"
            className="mt-3 font-display text-3xl font-bold tracking-[-0.02em] text-foreground md:text-4xl"
          >
            Built for modern radiology
          </h2>
          <p className="mt-4 text-lg text-muted">
            Everything Orasis AI brings to the reading room, from intelligent
            diagnostics to insights that compound over time.
          </p>
        </ScrollReveal>

        <ul className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = ICONS[feature.icon] ?? FALLBACK_ICON;
            const lgSpan = BENTO_LG_SPANS[index] ?? "lg:col-span-1";

            return (
              <li key={feature.title} className={lgSpan}>
                <ScrollReveal delay={index * STAGGER_STEP_MS} className="h-full">
                  <div className="group flex h-full flex-col rounded-lg border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 font-display text-xl font-semibold tracking-[-0.01em] text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-muted">
                      {feature.description}
                    </p>
                  </div>
                </ScrollReveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default ProductFeatures;
