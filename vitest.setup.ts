/**
 * Global test setup.
 *
 * - Registers `@testing-library/jest-dom` matchers (e.g. `toBeInTheDocument`).
 * - Polyfills `ResizeObserver`, which jsdom does not implement but some Radix
 *   primitives (e.g. the checkbox's size measurement) rely on.
 * - Unmounts React trees and clears the DOM after every test so component tests
 *   stay isolated.
 */
import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom has no ResizeObserver; provide a no-op stub so Radix primitives that
// observe element size can mount in the test environment.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

afterEach(() => {
  cleanup();
});
