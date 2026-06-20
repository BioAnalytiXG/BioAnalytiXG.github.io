# Implementation Plan: Website Rebuild (Next.js)

## Overview

This plan rebuilds the BioAnalytiX marketing site as a Next.js (App Router) + TypeScript
application styled with Tailwind CSS, shadcn/ui, and light-friendly Aceternity UI effects, deployed
to Vercel. Tasks are ordered by dependency: scaffolding and the design-token system come first, then
shared libraries and hooks, then layout, then sections/pages, then server-side forms, then SEO,
image optimization, automated testing, and deployment configuration. Each task builds on the
previous ones and ends with wiring into the running app, with no orphaned code.

Property-based tests use `fast-check` for the properties the design calls out (P2 form validity, P5
idempotent submit, and the hero index invariant); the remaining correctness properties are covered
by unit/integration tests. All test sub-tasks are marked optional with `*`.

## Tasks

- [x] 1. Project scaffolding and build configuration
  - [x] 1.1 Initialize Next.js App Router + TypeScript project at repo root
    - Scaffold `app/`, `components/`, `lib/`, `public/` with the App Router structure from the design
    - Install core dependencies (`next`, `react`, `react-dom`, `tailwindcss`, `postcss`,
      `autoprefixer`, `tailwind-merge`, `clsx`, `class-variance-authority`, `tailwindcss-animate`,
      `framer-motion`, `lucide-react`)
    - Add base `app/globals.css` import and an empty root `app/layout.tsx` + `app/page.tsx` stub so
      the app builds
    - _Requirements: 15.1_
  - [x] 1.2 Configure `next.config.ts` and build exclusions for Vercel
    - Enable `next/image` optimization (do NOT set `images.unoptimized`); configure remote/image
      settings and `metadataBase`-compatible options
    - Exclude the `Legacy/` folder from the build/deploy (tsconfig excludes + ensure it is outside
      the `app/` tree and not published)
    - _Requirements: 14.2, 15.3_

- [x] 2. Design system and theming
  - [x] 2.1 Define design-token CSS variables in `app/globals.css`
    - Add `:root` light tokens (color/type/spacing/radius/elevation) and the optional `.dark` block,
      plus the derived shadcn variable set, exactly per the Visual Design Language
    - Light theme is the default with no explicit theme preference
    - _Requirements: 12.1, 12.3_
  - [x] 2.2 Wire Tailwind theme and initialize shadcn/ui
    - Create `tailwind.config.ts` mapping `background`, `foreground`, `card`, `popover`, `primary`,
      `secondary`, `muted`, `accent`, `border`, `input`, `ring`, `destructive`, radius and shadow
      scales to `hsl(var(--token))`; map `font-display`/`font-sans` utilities
    - Run shadcn init so primitives consume the token variables
    - _Requirements: 12.1, 12.2, 13.4_
  - [x] 2.3 Set up Manrope via `next/font` and apply the heading type treatment
    - Self-host Manrope through the Next.js font pipeline (same-origin, `display: swap`), expose
      `--font-display` and `--font-sans`, and apply the bold (700) tightened-tracking heading scale
    - _Requirements: 13.1, 13.2, 13.3, 13.5, 13.6_
  - [x] 2.4 Write design-system consistency and contrast tests
    - **Property 8: Design-system consistency**
    - **Validates: Requirements 12.2, 12.5, 12.6**
    - Assert components reference named tokens (no ad-hoc literals) and computed text/UI color
      pairings meet the AA contrast thresholds

- [x] 3. Core library utilities and site configuration
  - [x] 3.1 Implement `lib/site-config.ts`
    - Define the single `NavItem[]` nav source, brand/logo config, per-route metadata defaults, and
      the press article data source
    - _Requirements: 2.1, 8.1_
  - [x] 3.2 Implement `lib/analytics.ts` gtag wrapper
    - Implement `trackPageView` and `trackEvent` that push to `dataLayer` only when `window.gtag`
      exists; no-op safely during SSR/prerender and when the global is unavailable
    - _Requirements: 9.2, 9.3, 9.4, 9.5_
  - [x] 3.3 Write unit tests for the analytics wrapper
    - Assert no-op (no throw) when `window.gtag`/SSR, and forwarding when the global exists
    - _Requirements: 9.4, 9.5_

- [x] 4. Animation and navigation hooks
  - [x] 4.1 Implement `useRotatingWord` hook
    - Cycle words on a bounded configurable interval (default 3000ms), loop after the last word,
      return `words[0]` and start no timer under `prefers-reduced-motion`, and clear the timer on
      unmount / before re-running setup
    - _Requirements: 10.2, 10.4, 11.1, 11.4, 11.5_
  - [x] 4.2 Write property test for the rotating-word index invariant
    - **Property 7: No timer leaks (hero index invariant)**
    - **Validates: Requirements 11.3, 11.4**
    - With `fast-check`, generate arbitrary non-empty `words` arrays and assert `0 <= index <
      words.length` for every emitted index and that the final index advances to 0
  - [x] 4.3 Implement `useActiveSection` scroll-spy hook
    - Use a single `IntersectionObserver` over the section ids, return the active id (or `null`
      before any intersect), and disconnect on unmount / before re-running setup
    - _Requirements: 2.8, 11.2, 11.5_
  - [x] 4.4 Implement reduced-motion handling and scroll-reveal wrapper
    - Provide a `prefers-reduced-motion` detector that updates within 1000ms of a preference change,
      and a scroll-reveal wrapper that fades/translates (16–48px, 200–800ms, once per element) when
      motion is allowed and renders the static final frame with no observer when reduced
    - _Requirements: 10.1, 10.3, 10.5_
  - [x] 4.5 Write unit tests for hook cleanup
    - **Property 7: No timer leaks**
    - **Validates: Requirements 11.1, 11.2, 11.5**
    - Assert timers are cleared and observers disconnected on unmount and on dependency re-run

- [x] 5. Layout components and root layout
  - [x] 5.1 Implement the sticky top `Navbar`
    - Render logo + horizontal links + exactly one primary CTA from the single nav source; become a
      translucent `backdrop-blur` bar with a 1px bottom border after 8px scroll and transparent
      within 8px of top; smooth-scroll to anchors (respecting reduced motion), route to standalone
      pages, fall through to the hosting route when an anchor is absent, and show exactly one
      active-link primary indicator via `useActiveSection`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  - [x] 5.2 Implement `MobileNav` Sheet drawer
    - Below `md` (768px), collapse links into a hamburger-triggered shadcn `Sheet` while keeping the
      logo and CTA visible; close the drawer after a link performs its navigation/scroll
    - _Requirements: 2.9, 2.10_
  - [x] 5.3 Implement `SiteFooter`
    - `--surface` footer with multi-column link grid, legal links (Privacy, Terms), tagline and
      copyright per the Visual Design Language
    - _Requirements: 1.2_
  - [x] 5.4 Implement the root layout
    - Wire fonts, light theme tokens, the GA gtag integration (measurement ID G-J5QG3LXERQ), default
      SEO metadata with `metadataBase` `https://bioanalytix.info`, and mount Navbar + footer
    - _Requirements: 8.1, 9.1, 12.3, 13.1_
  - [x] 5.5 Write unit tests for navigation rendering
    - Assert all `NavItem`s render in both desktop navbar and mobile drawer and the drawer closes
      after selection
    - _Requirements: 2.1, 2.9, 2.10_

- [x] 6. Checkpoint - layout and foundations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Aceternity effects, hero, and home sections
  - [x] 7.1 Implement light-friendly Aceternity background accents
    - Build the faint grid / soft gradient-spotlight accent components (lazy-loaded, low-contrast),
      gated on reduced motion; no dark particle field
    - _Requirements: 10.2, 10.3_
  - [x] 7.2 Implement the `Hero` section
    - Bold light hero with overline, display headline, `--primary` rotating word via
      `useRotatingWord`, lead subcopy, primary + secondary CTAs, over the Aceternity accent
    - _Requirements: 1.3, 10.2, 10.4_
  - [x] 7.3 Implement `trust-bar`, `about-section`, `press-section`, and `cta-section`
    - Build the trust strip (rendered only when logo assets exist), two-column about/mission, press
      cards with anchor-stable ids, and the conversion CTA band, all using token styling and
      scroll-reveal
    - _Requirements: 1.2, 1.3_
  - [x] 7.4 Implement `product-features` bento grid
    - Render exactly six polished SaaS feature cards (lucide icon tile, h3 title, muted body) in a
      bento/responsive grid with staggered scroll-reveal and hover lift
    - _Requirements: 1.3, 1.4_
  - [x] 7.5 Assemble the home `app/page.tsx`
    - Compose hero, trust bar, product features, about/mission, press, CTA band, and contact in order
    - _Requirements: 1.2, 1.3_
  - [x] 7.6 Write reduced-motion tests for hero and scroll reveals
    - **Property 4: Reduced motion**
    - **Validates: Requirements 10.3, 10.4**
    - Assert that under `prefers-reduced-motion: reduce` the hero shows a static first word, no
      rotation timer starts, and reveals render their static final frame with no observers

- [x] 8. Forms: schemas, server actions, and form components
  - [x] 8.1 Implement shared Zod schemas in `lib/schemas.ts`
    - Define `ContactValues` (name 1–100 trimmed, RFC 5322 email ≤254, message 1–5000 trimmed,
      `company` honeypot) and `BetaApplicationValues` (fullName ≤100, email, optional org/role ≤100,
      message ≤5000 optional, `consent === true`, `company` honeypot)
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 6.1_
  - [x] 8.2 Write unit tests for the Zod schemas
    - Assert acceptance of valid and rejection of invalid contact/beta values at the boundaries
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2_
  - [x] 8.3 Implement `lib/rate-limit.ts`
    - Per-IP/session rolling-window limiter; window clamped 1–3600s (default 60s) and max clamped
      1–1000 (default 5), applying defaults when configured values fall out of bounds
    - _Requirements: 6.3, 6.4, 6.6_
  - [x] 8.4 Implement `lib/forms.ts` submission strategies
    - Implement `serverActionStrategy` (primary) and `providerStrategy` (server-side alternate
      transport), plus `handleSubmit` that performs at most one attempt and validates before dispatch
    - _Requirements: 3.6, 4.5, 15.4_
  - [x] 8.5 Implement `app/actions/submit-contact.ts` Server Action
    - `"use server"`: re-validate with Zod, silently discard non-empty `company` honeypot with a
      success-identical response, enforce the rate limiter, read provider keys from server-only env,
      deliver, and return success/failure preserving no secrets
    - _Requirements: 3.8, 6.2, 6.4, 6.5, 15.4, 15.5_
  - [x] 8.6 Implement `app/actions/submit-beta.ts` Server Action
    - `"use server"`: re-validate all fields (return non-success without delivery on failure),
      honeypot discard, rate limiting, env-only keys, deliver, and return success/failure
    - _Requirements: 4.7, 4.8, 6.2, 6.4, 6.5, 15.4, 15.5_
  - [x] 8.7 Implement `contact-form.tsx`
    - shadcn Form (react-hook-form + Zod): client validation before any request, inline field
      errors, hidden `company` honeypot, single dispatch via strategy, disabled+spinner while
      pending, 30s timeout/abort, success confirmation, and retryable error preserving values
    - _Requirements: 3.4, 3.5, 3.6, 3.7, 3.9, 3.10, 3.11, 5.1, 5.3, 5.5, 6.1_
  - [x] 8.8 Implement `beta-application-form.tsx`
    - Same form contract for beta/careers fields incl. consent checkbox and honeypot: client
      validation, single dispatch, disabled+spinner while pending, success within 1s, 30s timeout,
      and retryable error preserving values
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.9, 4.10, 5.2, 5.4, 5.6, 6.1_
  - [x] 8.9 Write property test for form validity
    - **Property 2: Form validity**
    - **Validates: Requirements 3.4, 3.6, 4.3, 4.5**
    - With `fast-check`, generate arbitrary form objects and assert a network call is dispatched
      **iff** the schema validates (mock strategy)
  - [x] 8.10 Write property test for idempotent submit
    - **Property 5: Idempotent submit**
    - **Validates: Requirements 5.1, 5.2**
    - With `fast-check`, generate rapid repeated activations within a window and assert at most one
      network request per logical submit for both forms
  - [x] 8.11 Write unit tests for honeypot and rate limiting
    - Assert filled `company` yields a success-identical response with no delivery, and that
      exceeding the window throttles without leaking limit details
    - _Requirements: 6.2, 6.4, 6.6_

- [x] 9. Routes, pages, redirects, and 404
  - [x] 9.1 Implement About and Product (Orasis AI) pages
    - Build `app/about/page.tsx` and `app/product/page.tsx` with the shared page-header band, content
      sections, and closing CTA band → footer
    - _Requirements: 1.1, 1.2_
  - [x] 9.2 Implement the Press & News page with anchor-stable ids
    - Render one element per legacy press anchor (including `partnership-renewal`), derive each id
      from a unique slug matching `^[a-z0-9-]+$`, scroll a matching fragment into view within 1s of
      load, and remain at top without error for a non-matching fragment
    - _Requirements: 1.1, 1.2, 7.1, 7.2, 7.3, 7.4_
  - [x] 9.3 Implement Careers page with the beta application form
    - Build `app/careers/page.tsx` embedding `beta-application-form.tsx`
    - _Requirements: 1.1, 1.2_
  - [x] 9.4 Implement Privacy Policy and Terms & Conditions pages
    - Build `app/privacy-policy/page.tsx` and `app/terms-conditions/page.tsx` in the long-form prose
      measure
    - _Requirements: 1.1, 1.2_
  - [x] 9.5 Implement the branded `not-found.tsx`
    - Render the 404 within the layout with brand styling and a control returning to home
    - _Requirements: 1.6_
  - [x] 9.6 Implement legacy path redirects
    - Map `/About_us/`, `/our_product/`, `/press/`, `/careers/`, `/privacy-policy/`,
      `/terms-conditions/` to the rebuilt routes so no legacy destination 404s
    - _Requirements: 1.5_
  - [x] 9.7 Write content-parity test
    - **Property 1: Content parity**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
    - Assert each of the eight routes exists, the home page renders its six sections, and the
      features section renders exactly six entries
  - [x] 9.8 Write anchor-stability test
    - **Property 3: Anchor stability**
    - **Validates: Requirements 7.1, 7.2**
    - Assert one element id per legacy anchor (incl. `partnership-renewal`) and that all slugs match
      `^[a-z0-9-]+$` and are unique

- [x] 10. SEO metadata, sitemap, and robots
  - [x] 10.1 Add per-route metadata exports
    - Export `title` (≤60 chars), `description` (50–160 chars), canonical (absolute, rooted at
      `https://bioanalytix.info`), Open Graph (title/description/url/type + one ≥1200x630 image), and
      `summary_large_image` Twitter card for every indexable route; mark 404 `noindex`
    - _Requirements: 8.1, 8.2, 8.3, 8.5_
  - [x] 10.2 Implement `app/sitemap.ts` and `app/robots.ts`
    - Sitemap lists every indexable route's absolute URL (excluding 404); robots permits indexing and
      references the sitemap URL
    - _Requirements: 8.4, 8.5_
  - [x] 10.3 Write SEO-completeness test
    - **Property 6: SEO completeness**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
    - Assert every route exports valid title/description/canonical and that the sitemap/robots cover
      the indexable routes

- [x] 11. Image optimization and asset migration
  - [x] 11.1 Migrate brand image assets into `public/images`
    - Move the SVG logos, banners, and team/product photos used by the rebuilt site from `Legacy/`
      into `public/images`
    - _Requirements: 14.1_
  - [x] 11.2 Render all imagery through `next/image`
    - Use `next/image` with explicit width/height (or `fill`) + `sizes`, `priority` for above-the-fold
      (LCP) images and lazy loading for below-the-fold, and reserved layout space + alt text on error
    - _Requirements: 14.1, 14.3, 14.4, 14.5_

- [x] 12. Checkpoint - pages, forms, SEO, and images
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. End-to-end and accessibility testing
  - [x] 13.1 Write Playwright smoke tests
    - Assert each route renders, nav scrolls/routes, the contact form happy path (mocked endpoint)
      succeeds, and the 404 renders
    - _Requirements: 1.1, 1.5, 1.6, 2.4, 2.7, 3.9_
  - [x] 13.2 Write axe/Lighthouse accessibility and SEO checks
    - Run automated AA-level accessibility and SEO-metadata presence checks on key routes
    - _Requirements: 8.1, 12.5, 12.6_

- [x] 14. Deployment configuration
  - [x] 14.1 Configure Vercel deployment artifacts and domain
    - Add Vercel project/config files targeting a single deploy, document required server-only env
      vars (provider keys), confirm `Legacy/` exclusion holds in the deployed output, and update the
      `CNAME`/domain notes to repoint `bioanalytix.info` from GitHub Pages to Vercel
    - _Requirements: 15.1, 15.2, 15.3_

- [x] 15. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP.
- Each task references specific requirement clauses for traceability.
- Property-based tests (`fast-check`) cover P2 (form validity), P5 (idempotent submit), and the hero
  index invariant; P1, P3, P4, P6, P7, and P8 are covered by unit/integration tests but are each
  annotated with their property number and the requirements they validate.
- All eight correctness properties are covered: P1 (9.7), P2 (8.9), P3 (9.8), P4 (7.6), P5 (8.10),
  P6 (10.3), P7 (4.2, 4.5), P8 (2.4).
- Checkpoints ensure incremental validation at natural breaks.
- Deployment to production is performed by the operator outside this plan; task 14 only produces the
  configuration artifacts.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4", "3.1", "3.2", "4.1", "4.3", "4.4", "8.1", "8.3"] },
    { "id": 4, "tasks": ["3.3", "4.2", "4.5", "8.2", "8.4", "5.1", "5.2", "5.3"] },
    { "id": 5, "tasks": ["5.4", "8.5", "8.6", "7.1"] },
    { "id": 6, "tasks": ["5.5", "8.7", "8.8", "7.2", "7.3", "7.4"] },
    { "id": 7, "tasks": ["8.9", "8.10", "8.11", "7.5", "9.1", "9.2", "9.3", "9.4", "9.5"] },
    { "id": 8, "tasks": ["7.6", "9.6", "9.7", "9.8", "10.1", "11.1"] },
    { "id": 9, "tasks": ["10.2", "10.3", "11.2"] },
    { "id": 10, "tasks": ["13.1", "13.2", "14.1"] }
  ]
}
```
