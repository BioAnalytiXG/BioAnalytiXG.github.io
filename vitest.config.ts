import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for the BioAnalytiX rebuild.
 *
 * - `jsdom` environment so component/DOM tests (React Testing Library) work.
 * - The `@/*` path alias mirrors `tsconfig.json` ("@/*" -> "./*") so test
 *   imports resolve the same way the Next.js app does.
 * - A global setup file registers jest-dom matchers and per-test cleanup.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "Legacy/**", "e2e/**"],
    css: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
});
