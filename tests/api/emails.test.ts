import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing the module under test
vi.mock("@/lib/api-key", () => ({
  getSmtpConfigByApiKey: vi.fn(),
  getApiKeyStatus: vi.fn(),
}));

vi.mock("@/lib/emails", () => ({
  createEmail: vi.fn(),
  updateEmailStatus: vi.fn(),
}));

vi.mock("@/lib/pwd", () => ({
  decrypt: vi.fn(() => "decrypted-password"),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    apiKey: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn(),
    })),
  },
}));

import { sendEmail, type SendEmailInput } from "@/lib/send-email";
import { getSmtpConfigByApiKey, getApiKeyStatus } from "@/lib/api-key";
import { createEmail, updateEmailStatus } from "@/lib/emails";
import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";

const mockSmtpConfig = {
  id: "smtp1",
  tenant_id: "tenant1",
  name: "Gmail",
  host: "smtp.gmail.com",
  port: 587,
  security: "TLS",
  user: "test@gmail.com",
  pass: "encrypted-pass",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const validInput: SendEmailInput = {
  token: "valid-token",
  from: "Test <test@example.com>",
  to: "recipient@example.com",
  subject: "Test Subject",
  text: "Hello World",
};

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when API key has no SMTP config", async () => {
    vi.mocked(getSmtpConfigByApiKey).mockResolvedValue(null);

    const result = await sendEmail(validInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.statusCode).toBe(403);
      expect(result.error).toContain("Invalid API Key");
    }
  });

  it("returns 403 when getApiKeyStatus throws (invalid key)", async () => {
    vi.mocked(getSmtpConfigByApiKey).mockResolvedValue(mockSmtpConfig);
    vi.mocked(getApiKeyStatus).mockRejectedValue(new Error("not found"));

    const result = await sendEmail(validInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.statusCode).toBe(403);
    }
  });

  it("returns 400 when API key is inactive", async () => {
    vi.mocked(getSmtpConfigByApiKey).mockResolvedValue(mockSmtpConfig);
    vi.mocked(getApiKeyStatus).mockResolvedValue("inactive");

    const result = await sendEmail(validInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.statusCode).toBe(400);
      expect(result.error).toContain("inactive");
    }
  });

  it("returns 400 when required field 'to' is missing", async () => {
    vi.mocked(getSmtpConfigByApiKey).mockResolvedValue(mockSmtpConfig);
    vi.mocked(getApiKeyStatus).mockResolvedValue("active");

    const result = await sendEmail({ ...validInput, to: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.statusCode).toBe(400);
      expect(result.error).toContain("to");
    }
  });

  it("returns 400 when neither text nor html is provided", async () => {
    vi.mocked(getSmtpConfigByApiKey).mockResolvedValue(mockSmtpConfig);
    vi.mocked(getApiKeyStatus).mockResolvedValue("active");

    const result = await sendEmail({
      ...validInput,
      text: undefined,
      html: undefined,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.statusCode).toBe(400);
      expect(result.error).toContain("text");
    }
  });

  it("returns { id } on successful send", async () => {
    vi.mocked(getSmtpConfigByApiKey).mockResolvedValue(mockSmtpConfig);
    vi.mocked(getApiKeyStatus).mockResolvedValue("active");
    vi.mocked(prisma.apiKey.findUnique).mockResolvedValue({
      id: "key1",
      tenant_id: "tenant1",
    } as any);
    vi.mocked(createEmail).mockResolvedValue({
      id: "email-123",
      tenant_id: "tenant1",
      from: validInput.from,
      to: validInput.to,
      subject: validInput.subject,
      status: "pending",
      apiKeyId: "key1",
      createdAt: new Date(),
    } as any);
    vi.mocked(updateEmailStatus).mockResolvedValue({} as any);

    const mockSendMail = vi.fn().mockResolvedValue({});
    vi.mocked(nodemailer.createTransport).mockReturnValue({
      sendMail: mockSendMail,
    } as any);

    const result = await sendEmail(validInput);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.id).toBe("email-123");
    }
    expect(createEmail).toHaveBeenCalledWith(
      "key1", "tenant1",
      validInput.from, validInput.to, validInput.subject,
      "pending",
      undefined, "Hello World",
      undefined, undefined, undefined, undefined,
    );
    expect(updateEmailStatus).toHaveBeenCalledWith("email-123", "sent");
  });

  it("sets status to 'failed' when nodemailer throws", async () => {
    vi.mocked(getSmtpConfigByApiKey).mockResolvedValue(mockSmtpConfig);
    vi.mocked(getApiKeyStatus).mockResolvedValue("active");
    vi.mocked(prisma.apiKey.findUnique).mockResolvedValue({
      id: "key1",
      tenant_id: "tenant1",
    } as any);
    vi.mocked(createEmail).mockResolvedValue({
      id: "email-456",
      tenant_id: "tenant1",
      from: validInput.from,
      to: validInput.to,
      subject: validInput.subject,
      status: "pending",
      apiKeyId: "key1",
      createdAt: new Date(),
    } as any);
    vi.mocked(updateEmailStatus).mockResolvedValue({} as any);

    const mockSendMail = vi.fn().mockRejectedValue(new Error("SMTP connection refused"));
    vi.mocked(nodemailer.createTransport).mockReturnValue({
      sendMail: mockSendMail,
    } as any);

    const result = await sendEmail(validInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.statusCode).toBe(500);
      expect(result.error).toContain("SMTP connection refused");
    }
    expect(updateEmailStatus).toHaveBeenCalledWith("email-456", "failed");
  });

  it("validates replyTo email format", async () => {
    vi.mocked(getSmtpConfigByApiKey).mockResolvedValue(mockSmtpConfig);
    vi.mocked(getApiKeyStatus).mockResolvedValue("active");

    const result = await sendEmail({
      ...validInput,
      replyTo: "not-an-email",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.statusCode).toBe(400);
      expect(result.error).toContain("replyTo");
    }
  });

  it("passes cc, bcc, replyTo to createEmail", async () => {
    vi.mocked(getSmtpConfigByApiKey).mockResolvedValue(mockSmtpConfig);
    vi.mocked(getApiKeyStatus).mockResolvedValue("active");
    vi.mocked(prisma.apiKey.findUnique).mockResolvedValue({
      id: "key1",
      tenant_id: "tenant1",
    } as any);
    vi.mocked(createEmail).mockResolvedValue({
      id: "email-789",
      tenant_id: "tenant1",
      from: validInput.from,
      to: validInput.to,
      subject: validInput.subject,
      status: "pending",
      apiKeyId: "key1",
      createdAt: new Date(),
    } as any);
    vi.mocked(updateEmailStatus).mockResolvedValue({} as any);

    const mockSendMail = vi.fn().mockResolvedValue({});
    vi.mocked(nodemailer.createTransport).mockReturnValue({
      sendMail: mockSendMail,
    } as any);

    const result = await sendEmail({
      ...validInput,
      cc: "cc@example.com",
      bcc: "bcc@example.com",
      replyTo: "reply@example.com",
    });

    expect(result.success).toBe(true);
    expect(createEmail).toHaveBeenCalledWith(
      "key1", "tenant1",
      validInput.from, validInput.to, validInput.subject,
      "pending",
      undefined, "Hello World",
      undefined, "cc@example.com", "bcc@example.com", "reply@example.com",
    );
  });

  it("rejects attachment URLs to private 172.16-31.x.x range", async () => {
    vi.mocked(getSmtpConfigByApiKey).mockResolvedValue(mockSmtpConfig);
    vi.mocked(getApiKeyStatus).mockResolvedValue("active");

    const result = await sendEmail({
      ...validInput,
      attachments: [{
        filename: "test.pdf",
        url: "http://172.16.0.1/file.pdf",
      }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.statusCode).toBe(400);
      expect(result.error).toContain("Internal/local");
    }
  });
});
