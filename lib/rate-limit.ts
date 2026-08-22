import { createHash } from "crypto";

import { env } from "@/env.mjs";

// This module deliberately has neither `import "server-only"` nor a
// `"use server"` directive.
//
// "server-only" is not an installed package. lib/db.ts can import it because
// Next.js webpack-aliases the specifier, but that alias does not exist under
// vitest, so importing it here would break every test that touches this file.
//
// `"use server"` would turn every export into a server action, which is wrong
// for a synchronous helper (see lib/api-key.ts for a module that does want it).

type Bucket = {
  count: number;
  resetAtMs: number;
};

export type RateLimitReason = "ok" | "limit" | "capacity" | "disabled";

export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Absolute epoch milliseconds. Useful for tests and observability. */
  resetAtMs: number;
  /** Delta-seconds until the window resets, for RateLimit-Reset. */
  resetSeconds: number;
  /** Delta-seconds to wait, for Retry-After. At least 1 when not allowed. */
  retryAfterSeconds: number;
  reason: RateLimitReason;
};

export type RateLimiterConfig = {
  /** Requests permitted per window, per key. 0 or less disables the limiter. */
  limit: number;
  windowMs: number;
  maxEntries?: number;
  /** Injectable clock, so tests do not need fake timers. */
  now?: () => number;
};

export type RateLimiter = {
  check(token: string): RateLimitDecision;
  size(): number;
};

/**
 * Hard ceiling on tracked keys. Not configurable: it exists to bound memory,
 * and an operator who raises it is only enlarging the blast radius of the flood
 * it is meant to contain.
 */
const DEFAULT_MAX_ENTRIES = 10_000;

/**
 * Keys are stored as a SHA-256 digest rather than the raw token.
 *
 * This is what makes the entry cap a real memory bound: the limiter runs before
 * authentication, so token length is attacker-controlled up to node's 16 KB
 * header limit. Hashing pins every entry to a fixed size. It also keeps
 * plaintext keys out of heap dumps and out of anything this module might ever
 * log.
 *
 * It is not a security boundary. Tokens are stored in plaintext in the
 * database, so this must not be described as "we never hold your keys".
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createRateLimiter(config: RateLimiterConfig): RateLimiter {
  const limit = config.limit;
  const windowMs = config.windowMs;
  const maxEntries = config.maxEntries ?? DEFAULT_MAX_ENTRIES;
  const now = config.now ?? Date.now;

  const buckets = new Map<string, Bucket>();
  let lastSweepAtMs = 0;
  let lastCapacityWarnAtMs = 0;

  function sweep(nowMs: number): void {
    // Collect then delete, rather than deleting while iterating. Map#forEach is
    // used because tsconfig targets es5 without downlevelIteration, so
    // `for (const [k, v] of map)` and `[...map]` do not compile.
    const expired: string[] = [];
    buckets.forEach((bucket, key) => {
      if (bucket.resetAtMs <= nowMs) expired.push(key);
    });
    for (const key of expired) {
      buckets.delete(key);
    }
    lastSweepAtMs = nowMs;
  }

  /**
   * Synchronous by contract. There is no await between reading a bucket and
   * writing it back, which is the only reason concurrent requests cannot
   * interleave and overshoot the limit on a single-threaded event loop. Do not
   * make this async. tests/lib/rate-limit.test.ts pins that invariant.
   */
  function check(token: string): RateLimitDecision {
    const nowMs = now();

    if (limit <= 0) {
      return {
        allowed: true,
        limit: 0,
        remaining: 0,
        resetAtMs: nowMs,
        resetSeconds: 0,
        retryAfterSeconds: 0,
        reason: "disabled",
      };
    }

    // Two sweep triggers: routine housekeeping at most once per window, and
    // pressure relief when the table is full. The `lastSweepAtMs < nowMs` guard
    // caps forced sweeps at one per millisecond so a sustained flood cannot
    // turn every request into a full scan.
    const needsSweep =
      nowMs - lastSweepAtMs >= windowMs ||
      (buckets.size >= maxEntries && lastSweepAtMs < nowMs);
    if (needsSweep) sweep(nowMs);

    const key = hashToken(token);
    const existing = buckets.get(key);

    if (existing && existing.resetAtMs > nowMs) {
      const resetSeconds = Math.max(
        0,
        Math.ceil((existing.resetAtMs - nowMs) / 1000),
      );

      if (existing.count >= limit) {
        return {
          allowed: false,
          limit,
          remaining: 0,
          resetAtMs: existing.resetAtMs,
          resetSeconds,
          retryAfterSeconds: Math.max(1, resetSeconds),
          reason: "limit",
        };
      }

      existing.count += 1;
      return {
        allowed: true,
        limit,
        remaining: limit - existing.count,
        resetAtMs: existing.resetAtMs,
        resetSeconds,
        retryAfterSeconds: 0,
        reason: "ok",
      };
    }

    // A new bucket is needed: either the key is unseen, or its window expired.
    if (!existing && buckets.size >= maxEntries) {
      // The table is full of live windows even after sweeping.
      //
      // Refuse the newcomer rather than evicting anyone. Every eviction policy
      // hands an attacker a counter-reset primitive: flood until a throttled
      // key's bucket is dropped, and its next request starts a fresh window
      // with full quota. LRU is the worst of them, because a key that is being
      // throttled is by definition not being served and so goes cold first.
      //
      // The cost of refusing is that new or idle keys can be turned away for up
      // to one window. That is bounded and self-healing, since every junk
      // bucket expires within windowMs. An eviction bypass would be neither.
      if (nowMs - lastCapacityWarnAtMs >= windowMs) {
        lastCapacityWarnAtMs = nowMs;
        console.warn(
          `[rate-limit] tracking table at capacity (${buckets.size} keys). ` +
            "New API keys are refused until live windows expire.",
        );
      }
      const resetSeconds = Math.max(1, Math.ceil(windowMs / 1000));
      return {
        allowed: false,
        limit,
        remaining: 0,
        // Deliberately an over-estimate: every live bucket expires within one
        // window, so this never tells a client to retry too early.
        resetAtMs: nowMs + windowMs,
        resetSeconds,
        retryAfterSeconds: resetSeconds,
        reason: "capacity",
      };
    }

    const resetAtMs = nowMs + windowMs;
    buckets.set(key, { count: 1, resetAtMs });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAtMs,
      resetSeconds: Math.max(1, Math.ceil(windowMs / 1000)),
      retryAfterSeconds: 0,
      reason: "ok",
    };
  }

  return {
    check,
    size: () => buckets.size,
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __freesendRateLimiter: RateLimiter | undefined;
}

/**
 * The limiter is pinned to globalThis unconditionally, which lib/db.ts only
 * does in development.
 *
 * Next.js compiles each route handler as its own entry, and nothing guarantees
 * that /api/send-email and /api/emails receive the same instance of this
 * module. If the bundler emits two copies, each route gets its own Map and
 * alternating between them doubles the effective limit, which is exactly the
 * bypass this feature exists to close. Pinning the store to globalThis makes
 * that impossible, and also survives dev-mode hot reload.
 */
function getLimiter(): RateLimiter {
  if (!global.__freesendRateLimiter) {
    global.__freesendRateLimiter = createRateLimiter({
      limit: env.RATE_LIMIT_MAX,
      windowMs: env.RATE_LIMIT_WINDOW_MS,
    });
  }
  return global.__freesendRateLimiter;
}

/** Records a request against the process-wide limiter and returns the verdict. */
export function checkRateLimit(token: string): RateLimitDecision {
  return getLimiter().check(token);
}

/**
 * Response headers for a decision.
 *
 * Values are delta-seconds, per the IETF RateLimit header fields draft, not
 * epoch timestamps. Header names are case-insensitive on the wire, so these
 * match the lowercase `ratelimit-*` that Resend emits.
 *
 * Returns nothing at all when the limiter is disabled: advertising
 * "RateLimit-Limit: 0" would read as "you may make zero requests".
 */
export function rateLimitHeaders(
  decision: RateLimitDecision,
): Record<string, string> {
  if (decision.reason === "disabled") return {};

  const headers: Record<string, string> = {
    "RateLimit-Limit": String(decision.limit),
    "RateLimit-Remaining": String(decision.remaining),
    "RateLimit-Reset": String(decision.resetSeconds),
  };

  if (!decision.allowed) {
    headers["Retry-After"] = String(decision.retryAfterSeconds);
  }

  return headers;
}
