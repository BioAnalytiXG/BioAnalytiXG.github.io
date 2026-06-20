/**
 * Property 7: No timer leaks.
 *
 * Validates: Requirements 11.1, 11.2, 11.5
 *
 * Asserts that the animation/observer hooks clean up after themselves:
 *
 *  - useRotatingWord clears its `setInterval` timer on unmount (no scheduled
 *    callback survives the component) and, when its dependencies change while
 *    mounted, clears the previous timer before creating a new one — so at most
 *    one timer is active per hook instance (Requirements 11.1, 11.5).
 *
 *  - useActiveSection disconnects its IntersectionObserver on unmount and
 *    before re-running setup when the observed section ids change — so at most
 *    one observer is active per hook instance (Requirements 11.2, 11.5).
 *
 * jsdom does not implement `window.matchMedia` or `IntersectionObserver`, so
 * both are stubbed here with spy-able fakes.
 */
import { act, renderHook } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { useActiveSection } from "@/hooks/use-active-section";
import { useRotatingWord } from "@/hooks/use-rotating-word";

/**
 * Minimal `matchMedia` stub: reports motion is allowed (`matches: false`) so
 * useRotatingWord starts its rotation timer, and exposes spy-able
 * add/removeEventListener so the hook's change-subscription effect runs.
 */
function installMatchMediaStub() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("useRotatingWord timer cleanup (Requirements 11.1, 11.5)", () => {
  beforeEach(() => {
    installMatchMediaStub();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("clears the rotation interval on unmount so no callback is scheduled afterward", () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    const { unmount } = renderHook(() =>
      useRotatingWord(["alpha", "beta", "gamma"], 2000)
    );

    // A single rotation timer is active while mounted.
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    // The interval is cleared and nothing remains scheduled.
    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not advance the word after unmount", () => {
    const { result, unmount } = renderHook(() =>
      useRotatingWord(["alpha", "beta", "gamma"], 1000)
    );

    expect(result.current).toBe("alpha");

    unmount();
    const valueAfterUnmount = result.current;

    // Advancing well past several intervals must not trigger any state update,
    // because the timer was cleared on unmount.
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current).toBe(valueAfterUnmount);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears the previous timer before re-running when the interval changes (at most one active)", () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

    const { rerender, unmount } = renderHook(
      ({ interval }: { interval: number }) =>
        useRotatingWord(["alpha", "beta", "gamma"], interval),
      { initialProps: { interval: 2000 } }
    );

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(1);

    // Changing the (clamped) interval re-runs the effect.
    rerender({ interval: 5000 });

    // The previous timer was cleared before the new one was created, and only
    // one timer is active at a time.
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("useActiveSection observer cleanup (Requirements 11.2, 11.5)", () => {
  /** Live IntersectionObserver instances created during a test. */
  let observerInstances: MockIntersectionObserver[];

  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    takeRecords = vi.fn(() => []);
    disconnect: ReturnType<typeof vi.fn>;
    disconnected = false;

    constructor(
      public callback: IntersectionObserverCallback,
      public options?: IntersectionObserverInit
    ) {
      this.disconnect = vi.fn(() => {
        this.disconnected = true;
      });
      observerInstances.push(this);
    }
  }

  /** Count of observers that have been constructed but not yet disconnected. */
  const activeObservers = () =>
    observerInstances.filter((o) => !o.disconnected).length;

  /** Append elements with the given ids so `getElementById` resolves them. */
  function mountSections(ids: string[]) {
    for (const id of ids) {
      const el = document.createElement("div");
      el.id = id;
      document.body.appendChild(el);
    }
  }

  beforeEach(() => {
    observerInstances = [];
    installMatchMediaStub();
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("observes the rendered sections with a single observer", () => {
    mountSections(["home", "about", "contact"]);

    renderHook(() => useActiveSection(["home", "about", "contact"]));

    expect(observerInstances).toHaveLength(1);
    expect(observerInstances[0].observe).toHaveBeenCalledTimes(3);
    expect(activeObservers()).toBe(1);
  });

  it("disconnects the observer on unmount so no callback executes afterward", () => {
    mountSections(["home", "about"]);

    const { unmount } = renderHook(() =>
      useActiveSection(["home", "about"])
    );

    expect(activeObservers()).toBe(1);

    unmount();

    expect(observerInstances[0].disconnect).toHaveBeenCalledTimes(1);
    expect(activeObservers()).toBe(0);
  });

  it("disconnects the previous observer before re-running when the ids change (at most one active)", () => {
    mountSections(["home", "about", "extra"]);

    const { rerender, unmount } = renderHook(
      ({ ids }: { ids: string[] }) => useActiveSection(ids),
      { initialProps: { ids: ["home", "about"] } }
    );

    expect(observerInstances).toHaveLength(1);
    expect(activeObservers()).toBe(1);

    // Changing the set of ids re-runs the effect.
    rerender({ ids: ["home", "extra"] });

    // The first observer is disconnected before the second is created, and at
    // no point is more than one observer active.
    expect(observerInstances[0].disconnect).toHaveBeenCalledTimes(1);
    expect(observerInstances).toHaveLength(2);
    expect(activeObservers()).toBe(1);

    unmount();
    expect(activeObservers()).toBe(0);
  });
});
