import { describe, it, expect, vi, beforeEach } from "vitest";

// Keep the limit tiny so each test needs only a handful of requests.
vi.mock("@/env.mjs", () => ({
  env: { RATE_LIMIT_MAX: 2, RATE_LIMIT_WINDOW_MS: 60_000 },
}));

vi.mock("@/lib/send-email", () => ({
  sendEmail: vi.fn(async () => ({ success: true, id: "email-1" })),
}));

import { POST as postEmails } from "@/app/api/emails/route";
import { OPTIONS as optionsSendEmail, POST as postSendEmail } from "@/app/api/send-email/route";
import { sendEmail } from "@/lib/send-email";

// The limiter is a process-wide singleton pinned to globalThis, so tests share
// it. Isolating by token is enough and avoids exporting a reset hook purely for
// the benefit of tests.
let tokenCounter = 0;
const freshToken = () => `fsk_live_test${(tokenCounter += 1)}`;

function sendEmailRequest(token: string, body?: string) {
  return new Request("http://localhost:3000/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ?? JSON.stringify({ fromEmail: "a@b.com", to: "c@d.com", subject: "s", text: "t" }),
  });
}

function emailsRequest(token: string, body?: string) {
  return new Request("http://localhost:3000/api/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ?? JSON.stringify({ from: "a@b.com", to: "c@d.com", subject: "s", text: "t" }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("rate limiting across both send endpoints", () => {
  it("shares one counter between /api/send-email and /api/emails", async () => {
    // The bypass this feature exists to close. Both routes reach the same
    // sendEmail(), so they must draw on a single bucket. If the bundler ever
    // emitted two copies of lib/rate-limit.ts, this test would go red.
    const token = freshToken();

    expect((await postSendEmail(sendEmailRequest(token))).status).toBe(200);
    expect((await postEmails(emailsRequest(token))).status).toBe(200);

    // Limit is 2, and both routes have now been used once each.
    expect((await postSendEmail(sendEmailRequest(token))).status).toBe(429);
    expect((await postEmails(emailsRequest(token))).status).toBe(429);
  });

  it("refuses without reaching sendEmail", async () => {
    const token = freshToken();

    await postSendEmail(sendEmailRequest(token));
    await postSendEmail(sendEmailRequest(token));
    vi.clearAllMocks();

    const refused = await postSendEmail(sendEmailRequest(token));

    expect(refused.status).toBe(429);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("refuses before parsing the request body", async () => {
    // /api/emails answers malformed JSON with 400 invalid_request. Getting a
    // 429 instead is the direct evidence that the limiter runs ahead of
    // req.json(), so a flood never costs a body parse.
    const token = freshToken();

    await postEmails(emailsRequest(token));
    await postEmails(emailsRequest(token));

    const refused = await postEmails(emailsRequest(token, "{not valid json"));

    expect(refused.status).toBe(429);
    expect(await refused.json()).toMatchObject({ name: "rate_limit_exceeded" });
  });

  it("keeps each route's own error envelope", async () => {
    const a = freshToken();
    await postSendEmail(sendEmailRequest(a));
    await postSendEmail(sendEmailRequest(a));
    const plain = await (await postSendEmail(sendEmailRequest(a))).json();

    const b = freshToken();
    await postEmails(emailsRequest(b));
    await postEmails(emailsRequest(b));
    const resend = await (await postEmails(emailsRequest(b))).json();

    // Native shape.
    expect(plain).toEqual({ error: expect.any(String) });

    // Resend-compatible shape, so a drop-in client keeps parsing errors.
    expect(resend).toEqual({
      statusCode: 429,
      name: "rate_limit_exceeded",
      message: expect.any(String),
    });
  });
});

describe("rate limit headers", () => {
  it("appear on successful responses", async () => {
    const token = freshToken();

    const res = await postSendEmail(sendEmailRequest(token));

    expect(res.status).toBe(200);
    expect(res.headers.get("RateLimit-Limit")).toBe("2");
    expect(res.headers.get("RateLimit-Remaining")).toBe("1");
    expect(Number(res.headers.get("RateLimit-Reset"))).toBeGreaterThan(0);
    expect(res.headers.get("Retry-After")).toBeNull();
  });

  it("count down across both routes", async () => {
    const token = freshToken();

    const first = await postSendEmail(sendEmailRequest(token));
    const second = await postEmails(emailsRequest(token));

    expect(first.headers.get("RateLimit-Remaining")).toBe("1");
    expect(second.headers.get("RateLimit-Remaining")).toBe("0");
  });

  it("include Retry-After on a 429", async () => {
    const token = freshToken();

    await postSendEmail(sendEmailRequest(token));
    await postSendEmail(sendEmailRequest(token));
    const refused = await postSendEmail(sendEmailRequest(token));

    expect(refused.status).toBe(429);
    expect(refused.headers.get("RateLimit-Remaining")).toBe("0");
    expect(Number(refused.headers.get("Retry-After"))).toBeGreaterThanOrEqual(1);
  });

  it("are exposed to browser clients via CORS", async () => {
    const token = freshToken();

    const ok = await postSendEmail(sendEmailRequest(token));
    const preflight = await optionsSendEmail();

    for (const res of [ok, preflight]) {
      const exposed = res.headers.get("Access-Control-Expose-Headers") ?? "";
      expect(exposed).toContain("Retry-After");
      expect(exposed).toContain("RateLimit-Limit");
      expect(exposed).toContain("RateLimit-Remaining");
      expect(exposed).toContain("RateLimit-Reset");
    }
  });

  it("are absent from responses rejected before the limiter runs", async () => {
    // No Authorization header means no key to attribute the request to, so no
    // decision exists yet and advertising a remaining count would be fiction.
    const res = await postSendEmail(
      new Request("http://localhost:3000/api/send-email", {
        method: "POST",
        body: JSON.stringify({ fromEmail: "a@b.com" }),
      }),
    );

    expect(res.status).toBe(400);
    expect(res.headers.get("RateLimit-Limit")).toBeNull();
    expect(res.headers.get("RateLimit-Remaining")).toBeNull();
  });
});
