/**
 * Color-contrast utilities for verifying WCAG 2.1 contrast ratios against the
 * design-token system.
 *
 * Design tokens are stored in `app/globals.css` as HSL *channel triplets*
 * (e.g. `221 83% 53%`) with no `hsl()` wrapper, so Tailwind can compose them as
 * `hsl(var(--token) / <alpha>)`. These helpers parse those triplets and compute
 * the relative-luminance contrast ratio defined by WCAG.
 *
 * References:
 * - Relative luminance: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 * - Contrast ratio:     https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Parse an HSL channel triplet like `"221 83% 53%"` into `{ h, s, l }` (s/l as 0–1). */
export function parseHslTriplet(triplet: string): { h: number; s: number; l: number } {
  const match = triplet
    .trim()
    .match(/^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%$/);

  if (!match) {
    throw new Error(`Invalid HSL channel triplet: "${triplet}"`);
  }

  return {
    h: Number(match[1]),
    s: Number(match[2]) / 100,
    l: Number(match[3]) / 100,
  };
}

/** Convert an HSL channel triplet to 8-bit sRGB. */
export function hslTripletToRgb(triplet: string): Rgb {
  const { h, s, l } = parseHslTriplet(triplet);

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hPrime = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hPrime % 2) - 1));
  const m = l - c / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hPrime >= 0 && hPrime < 1) [r1, g1, b1] = [c, x, 0];
  else if (hPrime < 2) [r1, g1, b1] = [x, c, 0];
  else if (hPrime < 3) [r1, g1, b1] = [0, c, x];
  else if (hPrime < 4) [r1, g1, b1] = [0, x, c];
  else if (hPrime < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

/** WCAG relative luminance of an sRGB color. */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (value: number): number => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two colors (always >= 1). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Convenience: contrast ratio between two HSL channel triplets. */
export function contrastRatioFromTriplets(fg: string, bg: string): number {
  return contrastRatio(hslTripletToRgb(fg), hslTripletToRgb(bg));
}
