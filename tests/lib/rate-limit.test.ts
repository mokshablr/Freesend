import { describe, it, expect, vi } from "vitest";

// lib/rate-limit.ts imports @/env.mjs, and @t3-oss/env validates at import
// time. Vitest loads no .env file, so without this mock the module throws
// "Invalid environment variables" before the first assertion runs.
vi.mock("@/env.mjs", () => ({
  env: { RATE_LIMIT_MAX: 100, RATE_LIMIT_WINDOW_MS: 60_000 },
}));

import { createRateLimiter, rateLimitHeaders } from "@/lib/rate-limit";

const WINDOW_MS = 60_000;

/**
 * An injectable clock rather than vi.useFakeTimers(). Because
 * createRateLimiter() returns an instance owning its own Map, every test gets
 * fresh state with no vi.resetModules(), no beforeEach hook, and no test-only
 * reset export leaking into production code.
 */
function makeClock(startMs = 1_000_000) {
  const state = { nowMs: startMs };
  return {
    state,
    now: () => state.nowMs,
    advance: (ms: number) => {
      state.nowMs += ms;
    },
  };
}

function makeLimiter(overrides: Partial<{ limit: number; maxEntries: number }> = {}) {
  const clock = makeClock();
  const limiter = createRateLimiter({
    limit: overrides.limit ?? 3,
    windowMs: WINDOW_MS,
    maxEntries: overrides.maxEntries,
    now: clock.now,
  });
  return { limiter, clock };
}

describe("rate limiter: basic enforcement", () => {
  it("allows the first request and reports remaining", () => {
    const { limiter } = makeLimiter({ limit: 3 });

    const decision = limiter.check("key-a");

    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("ok");
    expect(decision.limit).toBe(3);
    expect(decision.remaining).toBe(2);
  });

  it("allows exactly `limit` requests and refuses the next", () => {
    const { limiter } = makeLimiter({ limit: 3 });

    expect(limiter.check("key-a").remaining).toBe(2);
    expect(limiter.check("key-a").remaining).toBe(1);
    expect(limiter.check("key-a").remaining).toBe(0);

    const refused = limiter.check("key-a");
    expect(refused.allowed).toBe(false);
    expect(refused.reason).toBe("limit");
    expect(refused.remaining).toBe(0);
  });

  it("keeps refusing while the window is open", () => {
    const { limiter, clock } = makeLimiter({ limit: 1 });

    limiter.check("key-a");
    clock.advance(WINDOW_MS - 1);

    expect(limiter.check("key-a").allowed).toBe(false);
  });

  it("reports a usable Retry-After on refusal", () => {
    const { limiter } = makeLimiter({ limit: 1 });

    limiter.check("key-a");
    const refused = limiter.check("key-a");

    expect(refused.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    expect(refused.retryAfterSeconds).toBeLessThanOrEqual(WINDOW_MS / 1000);
  });

  it("resets once the window elapses", () => {
    const { limiter, clock } = makeLimiter({ limit: 2 });

    limiter.check("key-a");
    limiter.check("key-a");
    expect(limiter.check("key-a").allowed).toBe(false);

    clock.advance(WINDOW_MS + 1);

    const afterReset = limiter.check("key-a");
    expect(afterReset.allowed).toBe(true);
    expect(afterReset.remaining).toBe(1);
  });

  it("keeps keys independent of one another", () => {
    const { limiter } = makeLimiter({ limit: 2 });

    limiter.check("key-a");
    limiter.check("key-a");
    expect(limiter.check("key-a").allowed).toBe(false);

    const other = limiter.check("key-b");
    expect(other.allowed).toBe(true);
    expect(other.remaining).toBe(1);
  });

  it("maps one token to exactly one bucket", () => {
    const { limiter } = makeLimiter({ limit: 10 });

    limiter.check("key-a");
    limiter.check("key-a");
    expect(limiter.size()).toBe(1);

    limiter.check("key-b");
    expect(limiter.size()).toBe(2);
  });
});

describe("rate limiter: disabled", () => {
  it("allows everything and stores nothing when limit is 0", () => {
    const clock = makeClock();
    const limiter = createRateLimiter({
      limit: 0,
      windowMs: WINDOW_MS,
      now: clock.now,
    });

    for (let i = 0; i < 50; i++) {
      const decision = limiter.check("key-a");
      expect(decision.allowed).toBe(true);
      expect(decision.reason).toBe("disabled");
    }

    expect(limiter.size()).toBe(0);
    expect(rateLimitHeaders(limiter.check("key-a"))).toEqual({});
  });
});

describe("rate limiter: capacity is not a counter-reset primitive", () => {
  it("refuses new keys at capacity without resetting an existing counter", () => {
    // The attack this guards against: an attacker floods the table with junk
    // tokens so that a throttled key's bucket is evicted, letting its next
    // request start a fresh window with full quota. The limiter avoids it by
    // never evicting: at capacity the newcomer is refused instead.
    const { limiter } = makeLimiter({ limit: 5, maxEntries: 3 });

    expect(limiter.check("victim").remaining).toBe(4);
    limiter.check("filler-1");
    limiter.check("filler-2");
    expect(limiter.size()).toBe(3);

    const newcomer = limiter.check("attacker-fresh-token");
    expect(newcomer.allowed).toBe(false);
    expect(newcomer.reason).toBe("capacity");
    expect(limiter.size()).toBe(3);

    // The victim's counter must have continued, not restarted. A reset would
    // show remaining === 4 again.
    const victimAgain = limiter.check("victim");
    expect(victimAgain.reason).toBe("ok");
    expect(victimAgain.remaining).toBe(3);
  });

  it("does not let a sustained flood raise an existing key's quota", () => {
    const { limiter } = makeLimiter({ limit: 2, maxEntries: 2 });

    limiter.check("victim");
    limiter.check("victim");
    expect(limiter.check("victim").allowed).toBe(false);

    limiter.check("filler");
    for (let i = 0; i < 100; i++) {
      expect(limiter.check(`junk-${i}`).allowed).toBe(false);
    }

    // Still throttled after the flood.
    expect(limiter.check("victim").allowed).toBe(false);
  });

  it("never locks out a key it is already tracking", () => {
    // A key whose window has expired replaces its own entry rather than
    // counting as a newcomer, so capacity pressure cannot shut out a client
    // that is already being tracked. Only genuinely unseen keys are refused.
    const { limiter, clock } = makeLimiter({ limit: 2, maxEntries: 2 });

    limiter.check("known");
    limiter.check("filler");
    expect(limiter.check("stranger").reason).toBe("capacity");

    clock.advance(WINDOW_MS + 1);
    // "filler" is still occupying a slot from the caller's point of view until
    // the next sweep, but "known" must be served regardless.
    const knownAgain = limiter.check("known");

    expect(knownAgain.allowed).toBe(true);
    expect(knownAgain.reason).toBe("ok");
    expect(knownAgain.remaining).toBe(1);
  });

  it("frees capacity once windows expire", () => {
    const { limiter, clock } = makeLimiter({ limit: 5, maxEntries: 2 });

    limiter.check("a");
    limiter.check("b");
    expect(limiter.check("c").reason).toBe("capacity");

    clock.advance(WINDOW_MS + 1);

    const afterExpiry = limiter.check("c");
    expect(afterExpiry.allowed).toBe(true);
    expect(afterExpiry.reason).toBe("ok");
  });

  it("sweeps expired buckets but spares live ones", () => {
    const { limiter, clock } = makeLimiter({ limit: 5, maxEntries: 10 });

    limiter.check("old"); // window closes at +60s
    clock.advance(50_000);
    limiter.check("fresh"); // window closes at +110s
    expect(limiter.size()).toBe(2);

    clock.advance(11_000); // now +61s, which triggers a sweep
    limiter.check("newcomer");

    // "old" expired and was swept; "fresh" was still live and survived.
    expect(limiter.size()).toBe(2);
    const freshAgain = limiter.check("fresh");
    expect(freshAgain.remaining).toBe(3); // third request on the same bucket
  });
});

describe("rate limiter: headers", () => {
  it("emits delta-second values and no Retry-After when allowed", () => {
    const { limiter } = makeLimiter({ limit: 3 });

    const headers = rateLimitHeaders(limiter.check("key-a"));

    expect(headers["RateLimit-Limit"]).toBe("3");
    expect(headers["RateLimit-Remaining"]).toBe("2");
    expect(Number(headers["RateLimit-Reset"])).toBeGreaterThan(0);
    expect(Number(headers["RateLimit-Reset"])).toBeLessThanOrEqual(60);
    expect(headers["Retry-After"]).toBeUndefined();
  });

  it("adds Retry-After when refused", () => {
    const { limiter } = makeLimiter({ limit: 1 });

    limiter.check("key-a");
    const headers = rateLimitHeaders(limiter.check("key-a"));

    expect(headers["RateLimit-Remaining"]).toBe("0");
    expect(Number(headers["Retry-After"])).toBeGreaterThanOrEqual(1);
  });

  it("emits only integer strings", () => {
    const { limiter } = makeLimiter({ limit: 1 });

    limiter.check("key-a");
    const headers = rateLimitHeaders(limiter.check("key-a"));

    for (const value of Object.values(headers)) {
      expect(value).toMatch(/^\d+$/);
    }
  });
});

describe("rate limiter: concurrency", () => {
  it("does not overshoot under concurrent calls", async () => {
    // check() is synchronous by contract: with no await between reading a
    // bucket and writing it back, the event loop cannot interleave two calls.
    // This test fails if anyone ever makes check() async.
    const { limiter } = makeLimiter({ limit: 100 });

    const decisions = await Promise.all(
      Array.from({ length: 120 }, () =>
        Promise.resolve().then(() => limiter.check("key-a")),
      ),
    );

    expect(decisions.filter((d) => d.allowed).length).toBe(100);
    expect(decisions.filter((d) => !d.allowed).length).toBe(20);
  });
});
