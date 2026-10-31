import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/env.mjs", () => ({
  env: { RATE_LIMIT_MAX: 100, RATE_LIMIT_WINDOW_MS: 60_000 },
}));

vi.mock("@/lib/send-email", () => ({
  sendEmail: vi.fn(async () => ({ success: true, id: "email-1" })),
}));

vi.mock("@/lib/api-key", () => ({
  getSmtpConfigByApiKey: vi.fn(async () => ({ id: "smtp-1" })),
}));

import { POST } from "@/app/api/emails/route";
import { sendEmail } from "@/lib/send-email";

// The rate limiter is shared across the process, so give each request its own key.
let tokenCounter = 0;
const freshToken = () => `fsk_live_attach${(tokenCounter += 1)}`;

function postWithAttachment(fields: Record<string, unknown>) {
  return POST(
    new Request("http://localhost:3000/api/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${freshToken()}` },
      body: JSON.stringify({
        from: "a@b.com",
        to: "c@d.com",
        subject: "s",
        html: '<img src="cid:logo">',
        attachments: [{ filename: "logo.png", content: "aGk=", ...fields }],
      }),
    }),
  );
}

const sentAttachment = () => vi.mocked(sendEmail).mock.calls[0][0].attachments?.[0];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/emails attachment fields", () => {
  it.each([
    { name: "content_id", fields: { content_id: "logo" } },
    { name: "contentId", fields: { contentId: "logo" } },
    { name: "inline_content_id", fields: { inline_content_id: "logo" } },
  ])("passes $name through as contentId", async ({ fields }) => {
    expect((await postWithAttachment(fields)).status).toBe(200);
    expect(sentAttachment()?.contentId).toBe("logo");
  });

  it("passes content_type through as contentType", async () => {
    expect((await postWithAttachment({ content_type: "image/png" })).status).toBe(200);
    expect(sentAttachment()?.contentType).toBe("image/png");
  });
});
