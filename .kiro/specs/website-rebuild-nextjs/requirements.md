# Requirements Document

## Introduction

This feature rebuilds the BioAnalytiX marketing site as a modern Next.js (App Router)
application using TypeScript, Tailwind CSS, shadcn/ui primitives, and Aceternity UI effects.
The rebuild preserves all existing content (Home, About Us, Our Product/Orasis AI, Press & News,
Careers, Privacy Policy, Terms & Conditions, and the 404 page), the Google Analytics integration,
and the SEO metadata, while replacing the legacy dark particle theme with a light + bold enterprise
SaaS visual identity governed by a defined design-token system. Forms move to server-side handling
via Next.js Server Actions with Zod validation, rate limiting, and honeypot spam protection. The
site is deployed to Vercel as the single target, with the `bioanalytix.info` domain repointed there
and the `Legacy/` folder excluded from the build.

These requirements are derived from the approved design document and are written so that the design's
eight correctness properties (content parity, form validity, anchor stability, reduced motion,
idempotent submit, SEO completeness, no timer leaks, and design-system consistency) can be traced
back to specific acceptance criteria.

## Glossary

- **Website**: The rebuilt BioAnalytiX Next.js application as a whole.
- **App_Router**: The Next.js App Router subsystem that maps route segments to rendered pages.
- **Navbar**: The top sticky header component containing the logo, horizontal navigation links, and primary CTA.
- **Mobile_Nav**: The hamburger-triggered shadcn `Sheet` drawer that presents navigation links below the `md` breakpoint.
- **Hero**: The home-page hero section with the bold headline and rotating word.
- **Contact_Form**: The contact form component and its supporting Server Action (`submitContact`).
- **Beta_Form**: The beta/careers application form component and its supporting Server Action (`submitBeta`).
- **Server_Action**: A Next.js `"use server"` function that performs authoritative server-side processing of a form submission.
- **Validator**: The shared Zod-schema validation logic used on both client and server.
- **Rate_Limiter**: The server-side per-IP/session throttling logic applied to form Server Actions.
- **Press_Page**: The Press & News route and its rendered article elements.
- **Design_System**: The set of design tokens (color, typography, spacing, radius, elevation) defined as CSS variables and Tailwind theme values.
- **Motion_System**: The framer-motion and Aceternity-driven animation layer (hero accents, rotating word, scroll reveals, hover transitions).
- **Analytics**: The Google Analytics integration (gtag, measurement ID G-J5QG3LXERQ) and its wrapper in `lib/analytics.ts`.
- **Build_Pipeline**: The Vercel build and deployment process for the Website.

## Requirements

### Requirement 1: Page and Content Parity

**User Story:** As a site visitor, I want every page and content section from the legacy site to remain available, so that no information or destination is lost in the rebuild.

#### Acceptance Criteria

1. THE App_Router SHALL provide exactly one route for each of the following eight pages: Home, About Us, Our Product/Orasis AI, Press & News, Careers, Privacy Policy, Terms & Conditions, and a catch-all 404 page.
2. WHEN a visitor opens a rebuilt route, THE App_Router SHALL render every primary content section that the corresponding legacy page contained, with no content section omitted.
3. WHEN the home page route is rendered, THE Website SHALL present all six of the following sections: hero, product features, about/mission, press, conversion CTA, and contact.
4. WHEN the home page product features section is rendered, THE App_Router SHALL display exactly six product feature entries.
5. WHEN a visitor requests a legacy path (/About_us/, /our_product/, /press/, /careers/, /privacy-policy/, or /terms-conditions/), THE App_Router SHALL serve the corresponding rebuilt route so that no legacy destination returns a 404.
6. IF a visitor navigates to a path that matches no defined route, THEN THE App_Router SHALL render the branded 404 page within 3 seconds, and the 404 page SHALL include a navigation control that returns the visitor to the home page.

### Requirement 2: Top Sticky Navigation

**User Story:** As a site visitor, I want a modern top navigation bar, so that I can move between pages and in-page sections on any device.

#### Acceptance Criteria

1. THE Navbar SHALL render, from a single navigation-item source, the logo, the horizontal navigation links, and exactly one primary call-to-action button.
2. WHILE the page is scrolled at least 8 pixels away from the top of the document, THE Navbar SHALL remain fixed at the top of the viewport and SHALL display a translucent backdrop-blur background with a 1-pixel bottom border.
3. WHILE the page is scrolled within 8 pixels of the top of the document, THE Navbar SHALL render with a transparent (non-blurred) background and no bottom border.
4. WHEN a visitor selects a navigation link that targets an in-page anchor and reduced motion is not requested, THE Navbar SHALL scroll the matching section into view using smooth scrolling and SHALL complete the scroll within 1000 milliseconds.
5. IF a visitor selects a navigation link that targets an in-page anchor and `prefers-reduced-motion: reduce` is set, THEN THE Navbar SHALL move the matching section into view without smooth-scroll animation.
6. IF a visitor selects a navigation link whose target in-page anchor does not exist on the current page, THEN THE Navbar SHALL navigate to the route that hosts the section and leave the current view unchanged until navigation completes.
7. WHEN a visitor selects a navigation link that targets a standalone route, THE App_Router SHALL navigate to that route.
8. WHILE a section or route is the active destination, THE Navbar SHALL indicate exactly one active link using a primary-color indicator.
9. WHILE the viewport width is below the `md` breakpoint (768 pixels), THE Navbar SHALL collapse the horizontal navigation links into the Mobile_Nav drawer opened by a hamburger trigger, while keeping the logo and the primary CTA visible.
10. WHEN a visitor selects any navigation link inside the Mobile_Nav drawer, THE Mobile_Nav SHALL close the drawer after performing the link's navigation or in-page scroll.

### Requirement 3: Contact Form Submission

**User Story:** As a prospective customer, I want to submit the contact form, so that I can reach BioAnalytiX and receive a response.

#### Acceptance Criteria

1. THE Validator SHALL require a contact submission to have a name that, after trimming leading and trailing whitespace, contains between 1 and 100 characters inclusive.
2. THE Validator SHALL require a contact submission to have an email address that conforms to the RFC 5322 addr-spec format and is at most 254 characters in length.
3. THE Validator SHALL require a contact submission to have a message that, after trimming leading and trailing whitespace, contains between 1 and 5000 characters inclusive.
4. WHEN a visitor submits the Contact_Form, THE Contact_Form SHALL validate the name, email, and message values with the Validator on the client before any network request.
5. IF client validation fails for one or more fields, THEN THE Contact_Form SHALL display an inline field-level error adjacent to each failing field and SHALL NOT dispatch a network request.
6. WHEN client validation succeeds, THE Contact_Form SHALL dispatch exactly one submission attempt through the configured submission strategy.
7. WHILE a submission attempt is in flight, THE Contact_Form SHALL disable the submit control to prevent additional submission attempts.
8. WHEN the Server_Action receives a contact submission, THE Server_Action SHALL re-validate the name, email, and message values with the Validator before delivery.
9. WHEN delivery succeeds, THE Contact_Form SHALL display a success confirmation and SHALL re-enable the submit control.
10. IF the Server_Action or its delivery provider returns a non-success result, THEN THE Contact_Form SHALL display a non-destructive inline error indicating the submission failed, preserve the entered name, email, and message values, and re-enable the submit control for retry.
11. IF a submission attempt does not complete within 30 seconds of dispatch, THEN THE Contact_Form SHALL abort the attempt, display a non-destructive inline error indicating a timeout, preserve the entered name, email, and message values, and re-enable the submit control for retry.

### Requirement 4: Beta / Careers Application Form

**User Story:** As a candidate or beta applicant, I want to submit the application form, so that I can request beta access or apply for a role.

#### Acceptance Criteria

1. THE Validator SHALL require a beta application to have a full name that is non-empty after trimming whitespace and at most 100 characters, an email address that conforms to the RFC 5322 addr-spec format and is at most 254 characters, a message of at most 5000 characters (an empty message is permitted), and a consent value strictly equal to boolean true.
2. WHERE the optional organization or role fields are provided, THE Validator SHALL require each to be at most 100 characters and SHALL accept the application when they are empty or omitted.
3. WHEN a visitor submits the Beta_Form, THE Beta_Form SHALL validate all field values with the Validator on the client before dispatching any network request.
4. IF client validation fails, THEN THE Beta_Form SHALL display an inline error message adjacent to each invalid field, SHALL keep all entered values intact, and SHALL NOT dispatch a network request.
5. WHEN client validation succeeds, THE Beta_Form SHALL dispatch exactly one submission attempt through the configured submission strategy.
6. WHILE a submission attempt is in progress, THE Beta_Form SHALL disable the submit control so that no additional submission attempt can be dispatched.
7. WHEN the Server_Action receives a beta application, THE Server_Action SHALL re-validate all field values with the Validator before delivery.
8. IF Server_Action re-validation fails, THEN THE Server_Action SHALL return a non-success result without attempting delivery.
9. WHEN delivery succeeds, THE Beta_Form SHALL display a success confirmation message within 1 second of receiving the success result.
10. IF the Server_Action or its delivery provider returns a non-success result, or no result is received within 30 seconds of dispatch, THEN THE Beta_Form SHALL display a non-destructive inline error message indicating the submission did not complete, SHALL preserve all entered values, and SHALL re-enable the submit control for retry.

### Requirement 5: Idempotent Submission

**User Story:** As a site visitor, I want repeated clicks on submit to be safe, so that I never send duplicate submissions.

#### Acceptance Criteria

1. WHEN a visitor activates the Contact_Form submit control two or more times within a 2000 millisecond window before a network request completes, THE Contact_Form SHALL produce at most one network request for that submission.
2. WHEN a visitor activates the Beta_Form submit control two or more times within a 2000 millisecond window before a network request completes, THE Beta_Form SHALL produce at most one network request for that submission.
3. WHILE a Contact_Form submission request is in flight, THE Contact_Form SHALL set the submit control to a disabled (non-activatable) state and display a visible pending indicator on the submit control.
4. WHILE a Beta_Form submission request is in flight, THE Beta_Form SHALL set the submit control to a disabled (non-activatable) state and display a visible pending indicator on the submit control.
5. WHEN a Contact_Form submission request completes with either a success or failure response, THE Contact_Form SHALL re-enable the submit control and remove the pending indicator.
6. WHEN a Beta_Form submission request completes with either a success or failure response, THE Beta_Form SHALL re-enable the submit control and remove the pending indicator.

### Requirement 6: Spam Protection and Rate Limiting

**User Story:** As a site operator, I want forms protected from abuse, so that automated spam and flooding do not reach delivery.

#### Acceptance Criteria

1. THE Contact_Form AND THE Beta_Form SHALL each render a honeypot field named "company" that is hidden from sighted users and assistive technology and is pre-populated with an empty value.
2. IF a submission arrives at the Server_Action with a "company" honeypot field whose trimmed value is non-empty, THEN THE Server_Action SHALL discard the submission without performing delivery, SHALL NOT persist or forward the submission content, and SHALL return a response identical to a successful submission response that reveals no rejection reason.
3. WHILE the number of submissions from a single client (identified by IP address and session) within the configured rolling window has not exceeded the configured maximum, THE Rate_Limiter SHALL allow the Server_Action to process the submission.
4. IF a client exceeds the configured maximum submissions within the configured rolling window, THEN THE Rate_Limiter SHALL cause the Server_Action to reject the submission without performing delivery and return a message indicating the client should retry later, without revealing the limit value or remaining quota.
5. THE Server_Action SHALL read all provider keys and secrets exclusively from server-only environment variables and SHALL NOT include any provider key or secret in any response, payload, or markup sent to the client.
6. THE Rate_Limiter SHALL use a configurable rolling window between 1 second and 3600 seconds (default 60 seconds) and a configurable maximum between 1 and 1000 submissions per window (default 5), and IF a configured value falls outside these bounds, THEN THE Rate_Limiter SHALL apply the corresponding default value.

### Requirement 7: Press Article Anchor Stability

**User Story:** As a visitor following an existing press link, I want anchored press links to keep working, so that shared and indexed URLs still resolve to the correct article.

#### Acceptance Criteria

1. THE Press_Page SHALL render exactly one element whose id matches each legacy press article anchor, including the known legacy anchor `partnership-renewal`.
2. THE Press_Page SHALL derive each article anchor id from a slug that matches the pattern `^[a-z0-9-]+$` and is unique among all article anchor ids on the page.
3. WHEN a visitor opens a URL whose fragment identifier matches the id of a rendered article element, THE Press_Page SHALL scroll that element into view within 1 second of page load completion.
4. IF a visitor opens a URL whose fragment identifier does not match the id of any rendered article element, THEN THE Press_Page SHALL remain at the top of the page without scrolling and without raising a visible error.

### Requirement 8: SEO Metadata Completeness

**User Story:** As a marketer, I want complete SEO metadata on every page, so that the site is correctly indexed and shared on social platforms.

#### Acceptance Criteria

1. THE App_Router SHALL export, for every route defined in Requirement 1, a non-empty `title` of at most 60 characters and a non-empty `description` between 50 and 160 characters.
2. THE App_Router SHALL export, for every indexable route (every route defined in Requirement 1 except the 404 page), a canonical URL that is an absolute URL rooted at `https://bioanalytix.info` and resolved from the configured `metadataBase`.
3. THE App_Router SHALL provide, for every indexable route, Open Graph metadata that includes a non-empty title, a non-empty description, an absolute `url`, a `type` value, and exactly one image of at least 1200x630 pixels, and a Twitter card whose type is `summary_large_image`.
4. THE App_Router SHALL publish a sitemap that lists the absolute URL of every indexable route defined in Requirement 1, and a robots file that permits indexing of those routes and references the published sitemap URL.
5. IF the requested path resolves to the 404 page, THEN THE App_Router SHALL export metadata that excludes the page from search indexing and SHALL omit it from the sitemap.

### Requirement 9: Analytics Preservation

**User Story:** As a marketer, I want the existing analytics to keep working, so that traffic measurement is uninterrupted after the rebuild.

#### Acceptance Criteria

1. WHEN the root layout renders in the browser, THE Website SHALL load the Google Analytics integration using measurement ID G-J5QG3LXERQ.
2. WHEN a tracked navigation occurs and the analytics global is available, THE Analytics SHALL forward a page view to the analytics layer.
3. WHEN a tracked event occurs and the analytics global is available, THE Analytics SHALL forward the event to the analytics layer.
4. IF the analytics global is unavailable, THEN THE Analytics SHALL perform no operation, return without raising an error, and THE Website SHALL continue rendering and responding to user interaction.
5. WHILE the Website is executing during server-side rendering or prerendering, THE Analytics SHALL perform no operation and SHALL raise no error.

### Requirement 10: Motion and Reduced-Motion Support

**User Story:** As a visitor, including those sensitive to motion, I want tasteful animation that respects my system preferences, so that the experience is engaging without being disruptive or inaccessible.

#### Acceptance Criteria

1. WHEN at least 10% of a section or card enters the viewport and `prefers-reduced-motion: reduce` is not set, THE Motion_System SHALL play a scroll-reveal transition that fades opacity from 0 to 1 and translates the element vertically from a starting offset of 16 to 48 pixels to its final position, completing within 200 to 800 milliseconds, and SHALL play the transition only once per element per page load.
2. WHILE `prefers-reduced-motion: reduce` is not set, THE Hero SHALL advance the rotating words sequentially at a configurable interval bounded between 1000 and 10000 milliseconds (default 3000 milliseconds), looping back to the first word after the last, and SHALL render the accent motion behind the headline continuously.
3. IF the visitor has `prefers-reduced-motion: reduce` set, THEN THE Motion_System SHALL render the static final frame of every animation, SHALL start no timers, and SHALL register no intersection observers.
4. WHILE `prefers-reduced-motion: reduce` is set, THE Hero SHALL display the first rotating word as static text without cycling and without starting any rotation timer.
5. WHEN the visitor changes the `prefers-reduced-motion` setting during a session, THE Motion_System SHALL apply the corresponding motion or reduced-motion behavior within 1000 milliseconds without requiring a page reload.

### Requirement 11: No Timer or Observer Leaks

**User Story:** As a site operator, I want animation hooks to clean up after themselves, so that the application does not leak timers or observers during navigation.

#### Acceptance Criteria

1. WHEN a component using the useRotatingWord timer-based animation hook unmounts, THE Motion_System SHALL clear that hook's active timer such that no scheduled timer callback executes after unmount.
2. WHEN a component using the useActiveSection intersection-observer hook unmounts, THE Motion_System SHALL disconnect that hook's IntersectionObserver such that no observer callback executes after unmount.
3. WHILE the useRotatingWord hook is cycling, THE Motion_System SHALL maintain the index invariant `0 <= index < words.length` for every emitted index value.
4. WHEN the useRotatingWord hook advances from the final index (`index == words.length - 1`), THE Motion_System SHALL set the next index to 0.
5. IF a hook re-runs its setup (for example, when its dependencies change while mounted), THEN THE Motion_System SHALL clear or disconnect the previously created timer or observer before creating a new one, so that at most one timer or observer per hook instance is active at any time.

### Requirement 12: Design-System Consistency

**User Story:** As a designer, I want all components to draw from a shared token system, so that the site reads as one cohesive, accessible enterprise product.

#### Acceptance Criteria

1. THE Design_System SHALL define color, typography, spacing, radius, and elevation values as CSS variables and Tailwind theme tokens, with every token referenced by a named identifier rather than a raw literal value.
2. WHERE a component applies color, typography, spacing, radius, or elevation, THE component SHALL derive the value from a named Design_System token, and SHALL contain zero ad-hoc literal values for these properties.
3. WHEN the Website loads without an explicit theme preference, THE Website SHALL render the light theme as the default primary visual identity.
4. WHERE the dark mode feature is enabled, THE Website SHALL render the dark theme while maintaining all contrast ratios specified in criterion 5.
5. THE Design_System SHALL ensure body and UI text color pairings meet a contrast ratio of at least 4.5:1, and large text (at least 18pt regular or 14pt bold) and non-text UI elements meet a contrast ratio of at least 3:1, measured against their adjacent background colors.
6. WHEN an interactive element receives keyboard focus, THE Website SHALL render a visible focus indicator that has a contrast ratio of at least 3:1 against both the element's adjacent colors and the unfocused state.

### Requirement 13: Typography and Fonts

**User Story:** As a visitor, I want fast, consistent typography, so that pages load quickly and read clearly.

#### Acceptance Criteria

1. THE Website SHALL self-host the Manrope font family through the Next.js font pipeline, serving font files from the same origin as the page with no requests to third-party font hosts.
2. WHEN a page is requested, THE Website SHALL load Manrope font files asynchronously such that text is rendered using a fallback font immediately and remains visible during font loading (no invisible-text period), and the request for the font file SHALL NOT block first paint of page content.
3. THE Design_System SHALL expose the display font family as the `--font-display` CSS variable and the body font family as the `--font-sans` CSS variable, with both variables resolving to the Manrope font family.
4. THE Design_System SHALL map the `--font-display` and `--font-sans` variables to Tailwind font-family utilities such that applying the corresponding utility class sets the element's computed font-family to Manrope.
5. WHERE a heading (levels 1 through 6) is rendered, THE Website SHALL apply the display font treatment defined by the type scale, including a bold font weight (700) and the tightened letter-spacing value defined by the type scale for headings.
6. IF a Manrope font file fails to load, THEN THE Website SHALL render all text using the defined sans-serif fallback font stack so that all text content remains visible and legible.

### Requirement 14: Image Optimization

**User Story:** As a visitor, I want images to load efficiently, so that pages remain fast on any connection.

#### Acceptance Criteria

1. WHERE a raster or vector asset is displayed, THE Website SHALL serve it through `next/image` with Vercel image optimization enabled and SHALL provide explicit width and height (or fill) plus a `sizes` value so that no asset renders without defined intrinsic dimensions.
2. THE Build_Pipeline SHALL NOT set `images.unoptimized`, so that responsive sizing, lazy loading, and modern formats remain active.
3. WHEN a browser that advertises support for AVIF or WebP requests an optimized raster asset, THE Website SHALL return the asset in a modern format (AVIF preferred, WebP as fallback), and SHALL return the original format only when the browser advertises no modern-format support.
4. WHERE an image is positioned below the initial viewport (not flagged as priority), THE Website SHALL defer its loading until it is within 0 pixels of entering the viewport; WHERE an image is flagged as priority (above-the-fold, including the Largest Contentful Paint element), THE Website SHALL load it eagerly without lazy-loading deferral.
5. IF an optimized image asset fails to load or returns an error, THEN THE Website SHALL reserve the asset's declared layout space without shifting surrounding content (cumulative layout shift contribution of 0) and SHALL render the asset's alternative text.

### Requirement 15: Deployment, Domain, and Legacy Exclusion

**User Story:** As a site operator, I want a single, modern deployment target with the existing domain, so that the rebuilt site goes live cleanly without legacy artifacts.

#### Acceptance Criteria

1. WHEN a build is triggered from the main branch, THE Build_Pipeline SHALL deploy the Website to Vercel as the single deployment target, with no other deployment target receiving the build output.
2. WHEN deployment to Vercel completes successfully, THE Build_Pipeline SHALL serve the Website on the `bioanalytix.info` domain via a CNAME repointed from GitHub Pages to Vercel, such that requests to `bioanalytix.info` resolve to the Vercel deployment over HTTPS within 5 seconds and are no longer served by GitHub Pages.
3. THE Build_Pipeline SHALL exclude the `Legacy/` folder from the build process and from the deployed output, such that no file or path under `Legacy/` is reachable in the deployed Website.
4. WHEN a visitor submits a form, THE Website SHALL execute all provider calls within Server Actions server-side, such that the client bundle delivered to the browser contains no provider secrets or credentials.
5. IF a form submission fails to be delivered by the provider, THEN THE Website SHALL retain the submitted input and return a response indicating delivery failure to the visitor.
