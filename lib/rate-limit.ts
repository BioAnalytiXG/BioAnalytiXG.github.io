/**
 * Simple in-memory, per-key (IP/session) rolling-window rate limiter for use
 * inside form Server Actions.
 *
 * Design notes (Requirements 6.3, 6.4, 6.6):
 * - A "key" identifies a single client, typically derived from IP address and/or
 *   session. Each key tracks the timestamps of its recent submissions.
 * - The limiter uses a rolling window: a submission is allowed while the number
 *   of submissions within the trailing `windowMs` has not exceeded `max`.
 *   (Req 6.3 — allow while under the configured max within the window.)
 * - When a key exceeds the configured maximum within the window, the limiter
 *   denies the submission. The denial signal is intentionally minimal: it
 *   reports only `allowed: false` and never the limit value or remaining quota,
 *   so callers cannot accidentally leak that information to clients.
 *   (Req 6.4 — reject without revealing the limit value or remaining quota.)
 * - The window is configurable between 1 and 3600 seconds (default 60s) and the
 *   maximum between 1 and 1000 submissions per window (default 5). Any
 *   configured value that is out of bounds OR non-finite (NaN/Infinity) falls
 *   back to the corresponding default. (Req 6.6.)
 *
 * This limiter is process-local and best-effort. It is suitable for a single
 * Server Action runtime instance; a distributed deployment would back this with
 * a shared store (e.g. Upstash) behind the same interface.
 */

/** Default rolling window length in seconds, applied when config is out of bounds. */
export const DEFAULT_WINDOW_SECONDS = 60;
/** Minimum allowed rolling window length in seconds. */
export const MIN_WINDOW_SECONDS = 1;
/** Maximum allowed rolling window length in seconds. */
export const MAX_WINDOW_SECONDS = 3600;

/** Default maximum submissions per window, applied when config is out of bounds. */
export const DEFAULT_MAX_SUBMISSIONS = 5;
/** Minimum allowed maximum submissions per window. */
export const MIN_MAX_SUBMISSIONS = 1;
/** Maximum allowed maximum submissions per window. */
export const MAX_MAX_SUBMISSIONS = 1000;

/** Configuration accepted by {@link createRateLimiter}. All fields optional. */
export interface RateLimiterConfig {
  /**
   * Rolling window length in seconds. Clamped to [1, 3600]; out-of-bounds or
   * non-finite values fall back to {@link DEFAULT_WINDOW_SECONDS}.
   */
  windowSeconds?: number;
  /**
   * Maximum submissions permitted per rolling window per key. Clamped to
   * [1, 1000]; out-of-bounds or non-finite values fall back to
   * {@link DEFAULT_MAX_SUBMISSIONS}.
   */
  maxSubmissions?: number;
  /**
   * Clock source returning the current time in milliseconds. Defaults to
   * {@link Date.now}. Primarily useful for deterministic testing.
   */
  now?: () => number;
}

/**
 * Result of a {@link RateLimiter.check} call.
 *
 * The shape is deliberately minimal: it exposes only whether the submission is
 * allowed. It does NOT include the configured limit or the remaining quota, so
 * that a denial cannot leak those values to the client (Req 6.4). Caller-facing
 * messaging ("please try again shortly") is the caller's responsibility.
 */
export interface RateLimitResult {
  /** `true` when the submission is permitted; `false` when throttled. */
  allowed: boolean;
}

/** A per-key rolling-window rate limiter instance. */
export interface RateLimiter {
  /**
   * Record a submission attempt for `key` and report whether it is allowed.
   *
   * A successful (allowed) check records the submission against the window. A
   * denied check does not add to the recorded submissions, so a throttled
   * client cannot extend its own penalty by retrying.
   *
   * @param key - Stable identifier for the client (e.g. IP and/or session).
   * @returns A {@link RateLimitResult} with only the `allowed` flag.
   */
  check(key: string): RateLimitResult;
  /** Remove any tracked state for `key` (e.g. for testing or manual reset). */
  reset(key: string): void;
  /** Remove all tracked state for every key. */
  clear(): void;
}

/**
 * Clamp a configured numeric value to `[min, max]`, falling back to `fallback`
 * when the value is `undefined`, non-finite (NaN/Infinity), or out of bounds.
 *
 * Per Req 6.6, an out-of-bounds value does NOT saturate to the nearest bound —
 * it falls back to the corresponding default.
 */
function resolveBoundedValue(
  value: number | undefined,
  min: number,
  max: number,
  fallback: number
): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  if (value < min || value > max) {
    return fallback;
  }
  return value;
}

/**
 * Create a new in-memory rolling-window rate limiter.
 *
 * @param config - Optional window/max overrides and clock injection.
 * @returns A {@link RateLimiter} instance with its own private state.
 */
export function createRateLimiter(config: RateLimiterConfig = {}): RateLimiter {
  const windowSeconds = resolveBoundedValue(
    config.windowSeconds,
    MIN_WINDOW_SECONDS,
    MAX_WINDOW_SECONDS,
    DEFAULT_WINDOW_SECONDS
  );
  const maxSubmissions = resolveBoundedValue(
    config.maxSubmissions,
    MIN_MAX_SUBMISSIONS,
    MAX_MAX_SUBMISSIONS,
    DEFAULT_MAX_SUBMISSIONS
  );

  const windowMs = windowSeconds * 1000;
  const now = config.now ?? Date.now;

  /** Map of key -> ascending timestamps (ms) of submissions inside the window. */
  const hits = new Map<string, number[]>();

  /** Drop timestamps older than the rolling window relative to `current`. */
  function prune(timestamps: number[], current: number): number[] {
    const threshold = current - windowMs;
    // Timestamps are appended in order, so the first index still in-window
    // marks the start of the retained slice.
    let start = 0;
    while (start < timestamps.length && timestamps[start] <= threshold) {
      start += 1;
    }
    return start === 0 ? timestamps : timestamps.slice(start);
  }

  return {
    check(key: string): RateLimitResult {
      const current = now();
      const existing = hits.get(key) ?? [];
      const inWindow = prune(existing, current);

      if (inWindow.length >= maxSubmissions) {
        // Denied: persist the pruned window (without recording this attempt) so
        // a throttled client cannot extend its penalty by retrying.
        hits.set(key, inWindow);
        return { allowed: false };
      }

      inWindow.push(current);
      hits.set(key, inWindow);
      return { allowed: true };
    },

    reset(key: string): void {
      hits.delete(key);
    },

    clear(): void {
      hits.clear();
    },
  };
}

/**
 * Read rate-limiter configuration from environment variables, applying the
 * documented bounds and defaults (Req 6.6). Non-numeric or out-of-bounds values
 * fall back to the defaults.
 *
 * Recognized variables:
 * - `RATE_LIMIT_WINDOW_SECONDS`
 * - `RATE_LIMIT_MAX_SUBMISSIONS`
 */
export function rateLimiterConfigFromEnv(
  env: Record<string, string | undefined> = process.env
): RateLimiterConfig {
  const parse = (raw: string | undefined): number | undefined => {
    if (raw === undefined || raw.trim() === "") {
      return undefined;
    }
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  return {
    windowSeconds: parse(env.RATE_LIMIT_WINDOW_SECONDS),
    maxSubmissions: parse(env.RATE_LIMIT_MAX_SUBMISSIONS),
  };
}

/**
 * Shared default limiter instance for the form Server Actions, configured from
 * environment variables. Server Actions can import this directly, or construct
 * their own instance via {@link createRateLimiter} when isolation is desired.
 */
export const formRateLimiter: RateLimiter = createRateLimiter(
  rateLimiterConfigFromEnv()
);
