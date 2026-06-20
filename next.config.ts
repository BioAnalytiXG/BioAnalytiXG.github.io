import type { NextConfig } from "next";

/**
 * Content-Security-Policy.
 *
 * Tuned for this app: same-origin by default, self-hosted fonts, consent-gated
 * Google Analytics (script from googletagmanager.com, beacons to
 * google-analytics.com), local video/images, and no external frames. `'unsafe-inline'`
 * is required for scripts because the app is statically generated and Next's
 * hydration + the GA config use inline scripts (a nonce-based CSP would require
 * dynamic rendering via middleware). In development we additionally allow
 * `'unsafe-eval'` and websockets so HMR keeps working.
 */
function contentSecurityPolicy(): string {
  const isDev = process.env.NODE_ENV !== "production";

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "https://www.googletagmanager.com",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://www.googletagmanager.com",
      "https://*.google-analytics.com",
    ],
    "font-src": ["'self'", "data:"],
    "media-src": ["'self'"],
    "connect-src": [
      "'self'",
      "https://www.googletagmanager.com",
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
      ...(isDev ? ["ws:", "wss:"] : []),
    ],
    "frame-src": ["'self'"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "object-src": ["'none'"],
  };

  const policy = Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");

  // Upgrade any stray http subresources to https in production only.
  return isDev ? policy : `${policy}; upgrade-insecure-requests`;
}

/** Security headers applied to every response. */
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  // Image optimization is handled by Vercel. We intentionally DO NOT set
  // `images.unoptimized` so that responsive sizing, lazy loading, and modern
  // formats (AVIF preferred, WebP fallback) remain active. (Requirement 14.2)
  images: {
    // Modern formats: AVIF preferred, WebP as fallback. The original format is
    // only returned when the browser advertises no modern-format support.
    formats: ["image/avif", "image/webp"],
    // Allow optimized remote assets if any are referenced. Local assets under
    // /public are optimized automatically; add hosts here as needed.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bioanalytix.info",
      },
    ],
  },

  // Exclude the Legacy/ folder from the build's file tracing so that no file or
  // path under Legacy/ is bundled into the deployed output. (Requirement 15.3)
  // Combined with the tsconfig `exclude` and `.vercelignore`, this keeps the
  // legacy site fully out of the Vercel build and deployment.
  outputFileTracingExcludes: {
    "*": ["./Legacy/**/*"],
  },

  // Security headers applied to all routes (CSP, HSTS, anti-clickjacking, etc.).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // Map every legacy destination to its rebuilt route so that no legacy URL
  // returns a 404. (Requirement 1.5) The legacy site exposed each page both as
  // a folder-style URL (e.g. /About_us/) and as an `.html` file
  // (e.g. /About_us.html). Routes whose rebuilt path differs from the legacy
  // path (About_us -> /about, our_product -> /product) need a path redirect;
  // routes whose rebuilt path already matches (press, careers, privacy-policy,
  // terms-conditions) only need their `.html` variants redirected, since the
  // trailing-slash folder form resolves to the matching route automatically.
  // All redirects are permanent (HTTP 308) to preserve SEO link equity.
  async redirects() {
    return [
      // About Us — rebuilt route differs from legacy path.
      { source: "/About_us", destination: "/about", permanent: true },
      { source: "/About_us.html", destination: "/about", permanent: true },

      // Our Product / Orasis AI — rebuilt route differs from legacy path.
      { source: "/our_product", destination: "/product", permanent: true },
      { source: "/our_product.html", destination: "/product", permanent: true },

      // Pages whose rebuilt route matches the legacy path: only the legacy
      // `.html` file variants need redirecting (the folder form already
      // resolves to the matching route).
      { source: "/press.html", destination: "/press", permanent: true },
      { source: "/careers.html", destination: "/careers", permanent: true },
      {
        source: "/privacy-policy.html",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/terms-conditions.html",
        destination: "/terms-conditions",
        permanent: true,
      },

      // Legacy home page file variant.
      { source: "/index.html", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
