import http from "node:http";

import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright end-to-end configuration for the BioAnalytiX rebuild (Task 13.1).
 *
 * The smoke suite runs against a production build of the Next.js app:
 * `next build && next start` on {@link PORT}. Vitest is configured to EXCLUDE
 * `e2e/**` (see `vitest.config.ts`), so these `*.spec.ts` files never run under
 * the unit-test runner and Playwright owns them exclusively.
 *
 * Contact-form happy path: the contact submission flows through a Server Action
 * (`submitContact`) -> `providerStrategy` -> a SERVER-SIDE `fetch` to
 * `process.env.CONTACT_FORM_ENDPOINT`. That fetch originates from the Next
 * server process, NOT the browser, so Playwright's `page.route` (which only
 * intercepts browser-context requests) cannot stub it. Instead we start a tiny
 * in-process stub HTTP server here and point the app's
 * `CONTACT_FORM_ENDPOINT` at it via the `webServer.env`, giving a real,
 * end-to-end happy path that exercises the action, rate limiter, and provider
 * transport against a controlled 200 response.
 */

/** Port the Next.js app is served on during e2e. */
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const BASE_URL = `http://127.0.0.1:${PORT}`;

/** Port for the in-process stub that stands in for the contact provider. */
const STUB_PORT = Number(process.env.PLAYWRIGHT_STUB_PORT ?? 8799);
const CONTACT_FORM_ENDPOINT = `http://127.0.0.1:${STUB_PORT}/contact`;

/**
 * Start the contact-provider stub once per Playwright process. It always
 * answers `200 { ok: true }`, which lets the contact Server Action's
 * server-side `fetch` resolve to success.
 *
 * `unref()` is critical: it prevents the listening socket from keeping the
 * Node event loop alive, so commands that load this config without running the
 * suite (notably `playwright test --list`) still exit cleanly. Errors such as
 * `EADDRINUSE` (e.g. a reused dev server) are swallowed so listing/startup
 * never fails on a busy port.
 */
function startContactStub(): void {
  if (process.env.PLAYWRIGHT_SKIP_STUB === "1") {
    return;
  }

  try {
    const stub = http.createServer((req, res) => {
      // Drain the request body, then always acknowledge with 200.
      req.on("data", () => {});
      req.on("end", () => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      });
    });

    stub.on("error", () => {
      // Ignore bind errors (e.g. EADDRINUSE) — a server is already listening.
    });

    stub.listen(STUB_PORT, "127.0.0.1");
    stub.unref();
  } catch {
    // Never let stub setup break configuration loading.
  }
}

startContactStub();

export default defineConfig({
  testDir: "e2e",
  /* Run files in parallel within the single smoke spec. */
  fullyParallel: true,
  /* Fail the build on CI if `test.only` is committed by mistake. */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    /* Build then serve a production build of the app on PORT. */
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      // The Server Action reads this server-only var and POSTs the validated
      // payload to our in-process stub, which returns 200 (happy path).
      CONTACT_FORM_ENDPOINT,
    },
  },
});
