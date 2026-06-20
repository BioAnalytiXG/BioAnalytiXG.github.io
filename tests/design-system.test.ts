/**
 * Property 8: Design-system consistency.
 *
 * Validates: Requirements 12.2, 12.5, 12.6
 *
 * Two facets are checked:
 *
 *  (1) Contrast — the design tokens parsed from `app/globals.css` produce
 *      text/UI color pairings that meet the WCAG AA thresholds the design's
 *      "Accessibility (Color Contrast)" section commits to:
 *        - body / UI text vs adjacent background  >= 4.5:1
 *        - large text & non-text UI (incl. focus) >= 3:1
 *
 *  (2) Token-usage consistency — color/typography/spacing/radius/elevation are
 *      expressed as named design tokens, not ad-hoc literals: the required
 *      tokens are defined as CSS variables in `app/globals.css`, the Tailwind
 *      theme references them via `hsl(var(--token))`, and component source
 *      contains no hard-coded color literals (the check scans `components/`
 *      today and extends automatically as components are added).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

import { contrastRatioFromTriplets } from "@/lib/color-contrast";

const ROOT = process.cwd();
const GLOBALS_CSS = join(ROOT, "app", "globals.css");
const TAILWIND_CONFIG = join(ROOT, "tailwind.config.ts");
const COMPONENTS_DIR = join(ROOT, "components");

/** AA thresholds (Requirement 12.5 / 12.6). */
const AA_TEXT = 4.5;
const AA_LARGE_OR_NONTEXT = 3;

/**
 * Extract the token map from the first `:root { ... }` block of globals.css.
 * The light theme is the default/primary identity (Requirement 12.3), so it is
 * the authoritative set for the AA contrast commitments.
 */
function parseRootTokens(css: string): Record<string, string> {
  const start = css.indexOf(":root");
  expect(start, "globals.css must define a :root token block").toBeGreaterThan(-1);

  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  const body = css.slice(open + 1, close);

  const tokens: Record<string, string> = {};
  for (const line of body.split("\n")) {
    // Strip inline comments, then match `--name: value;`.
    const cleaned = line.replace(/\/\*.*?\*\//g, "");
    const match = cleaned.match(/(--[\w-]+)\s*:\s*([^;]+);/);
    if (match) {
      tokens[match[1].trim()] = match[2].trim();
    }
  }
  return tokens;
}

/** Recursively collect component source files for the literal-usage scan. */
function collectSourceFiles(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }

  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectSourceFiles(full));
    } else if (/\.(tsx|jsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

const css = readFileSync(GLOBALS_CSS, "utf8");
const tokens = parseRootTokens(css);

describe("Property 8: Design-system consistency — token definitions (Req 12.2)", () => {
  // Every property the design system styles with must exist as a NAMED token,
  // so components can reference identifiers instead of raw literals (Req 12.2).
  const REQUIRED_TOKENS = [
    // color — base / surfaces
    "--background",
    "--surface",
    "--foreground",
    "--muted",
    "--border",
    "--input",
    "--ring",
    // color — brand / accent
    "--primary",
    "--primary-foreground",
    "--accent",
    "--accent-foreground",
    // color — shadcn surface/text pairs
    "--card",
    "--card-foreground",
    "--secondary",
    "--secondary-foreground",
    "--destructive",
    "--destructive-foreground",
    // radius (typography + elevation tokens are wired in tailwind.config)
    "--radius",
  ];

  it.each(REQUIRED_TOKENS)("defines the %s token as a CSS variable", (name) => {
    expect(tokens[name], `${name} must be defined in :root of globals.css`).toBeDefined();
    expect(tokens[name]).not.toBe("");
  });

  it("expresses radius as a named token, not an ad-hoc literal", () => {
    expect(tokens["--radius"]).toMatch(/^[\d.]+rem$/);
  });

  it("maps Tailwind theme colors back to the CSS variables via hsl(var(--token))", () => {
    const tw = readFileSync(TAILWIND_CONFIG, "utf8");
    for (const ref of [
      "hsl(var(--background))",
      "hsl(var(--foreground))",
      "hsl(var(--primary))",
      "hsl(var(--border))",
      "hsl(var(--ring))",
    ]) {
      expect(tw, `tailwind.config.ts should reference ${ref}`).toContain(ref);
    }
  });
});

describe("Property 8: Design-system consistency — AA contrast (Req 12.5, 12.6)", () => {
  // Pairings the design's Accessibility section commits to at the >= 4.5:1
  // body/UI text threshold.
  const TEXT_PAIRINGS: Array<{ label: string; fg: string; bg: string }> = [
    { label: "foreground on background", fg: "--foreground", bg: "--background" },
    { label: "muted text on background", fg: "--muted", bg: "--background" },
    { label: "foreground on surface", fg: "--foreground", bg: "--surface" },
    { label: "primary-foreground on primary", fg: "--primary-foreground", bg: "--primary" },
    { label: "card-foreground on card", fg: "--card-foreground", bg: "--card" },
    {
      label: "secondary-foreground on secondary",
      fg: "--secondary-foreground",
      bg: "--secondary",
    },
    { label: "accent-foreground on accent", fg: "--accent-foreground", bg: "--accent" },
  ];

  it.each(TEXT_PAIRINGS)("$label meets AA text contrast (>= 4.5:1)", ({ fg, bg }) => {
    const ratio = contrastRatioFromTriplets(tokens[fg], tokens[bg]);
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
  });

  // Non-text UI / focus indicator pairings at the >= 3:1 threshold (Req 12.6):
  // the focus ring and primary UI surface must stand out against the canvas.
  const NONTEXT_PAIRINGS: Array<{ label: string; fg: string; bg: string }> = [
    { label: "focus ring on background", fg: "--ring", bg: "--background" },
    { label: "primary UI on background", fg: "--primary", bg: "--background" },
  ];

  it.each(NONTEXT_PAIRINGS)(
    "$label meets non-text/large-text contrast (>= 3:1)",
    ({ fg, bg }) => {
      const ratio = contrastRatioFromTriplets(tokens[fg], tokens[bg]);
      expect(ratio).toBeGreaterThanOrEqual(AA_LARGE_OR_NONTEXT);
    },
  );

  it("renders the focus ring distinctly from the unfocused border (Req 12.6)", () => {
    // The focus indicator (--ring) must be visibly different from the resting
    // --border so focus is perceivable; they must not resolve to the same color.
    expect(tokens["--ring"]).not.toBe(tokens["--border"]);
  });
});

describe("Property 8: Design-system consistency — no ad-hoc color literals (Req 12.2)", () => {
  // Detects hard-coded color literals (hex, rgb/rgba, hsl/hsla with raw numeric
  // args) in component source. Tokenized usage like `hsl(var(--primary))` is NOT
  // a literal and is correctly ignored because it contains a `var(...)` arg.
  const HEX = /#[0-9a-fA-F]{3,8}\b/;
  const FUNC = /\b(?:rgba?|hsla?)\(\s*[\d.]/; // a function whose first arg is numeric

  // Token-usage discipline (Req 12.2) governs the design-system SURFACES —
  // buttons, cards, sections, layout chrome, form controls. A small set of
  // components is intentionally exempt because raw color values are inherent to
  // what they render and cannot be expressed as semantic tokens:
  //
  //  • Decorative vector art / SVG scenes (gradients, stop colors, sparkles).
  //  • Faithful product mockups that must reproduce an EXTERNAL product's exact
  //    palette (the Gnosis app teal, the Orasis radiology viewer), so the
  //    on-page preview matches the real product.
  //  • Generic third-party / shadcn primitives that accept arbitrary color
  //    props (charts, particles, animated beam) and default to literals.
  //
  // Paths are relative to `components/`, using POSIX separators. Each entry is
  // verified to exist below so the allowlist cannot silently rot.
  const EXEMPT_FILES = new Set<string>([
    // Decorative SVG illustrations / backgrounds
    "background-pattern.tsx",
    "gnosis-avatar.tsx",
    "hero-illustration.tsx",
    "press-hero-illustration.tsx",
    "press/coverage-hero-illustration.tsx",
    // Faithful product mockups (reproduce external product palettes)
    "gnosis-dashboard-preview.tsx",
    "orasis-capability-demos.tsx",
    "orasis-dashboard-preview.tsx",
    "orasis-process-flow.tsx",
    // Generic third-party / shadcn primitives with raw color props
    "ui/animated-beam.tsx",
    "ui/chart.tsx",
    "ui/particles.tsx",
  ]);

  /** Component-relative POSIX path, e.g. "ui/chart.tsx". */
  const toRelative = (file: string): string =>
    relative(COMPONENTS_DIR, file).split(sep).join("/");

  const allFiles = collectSourceFiles(COMPONENTS_DIR);
  const files = allFiles.filter((file) => !EXEMPT_FILES.has(toRelative(file)));

  it("scans component source files for color usage", () => {
    // Guard so the suite stays meaningful as components are added; the repo
    // always has at least the motion wrapper today.
    expect(Array.isArray(files)).toBe(true);
    expect(files.length).toBeGreaterThan(0);
  });

  it("keeps the literal-exemption allowlist honest (every exempt file exists)", () => {
    const present = new Set(allFiles.map(toRelative));
    for (const exempt of EXEMPT_FILES) {
      expect(present.has(exempt), `exempt file no longer exists: ${exempt}`).toBe(true);
    }
  });

  it("contains zero hard-coded color literals in design-system components", () => {
    const offenders: string[] = [];

    for (const file of files) {
      const contents = readFileSync(file, "utf8");
      contents.split("\n").forEach((line, index) => {
        if (HEX.test(line) || FUNC.test(line)) {
          offenders.push(`${file}:${index + 1}: ${line.trim()}`);
        }
      });
    }

    expect(offenders, `Use design tokens instead of literals:\n${offenders.join("\n")}`).toEqual(
      [],
    );
  });
});
