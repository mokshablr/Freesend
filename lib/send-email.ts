import nodemailer from "nodemailer";

import { getApiKeyStatus, getSmtpConfigByApiKey } from "@/lib/api-key";
import { createEmail, updateEmailStatus } from "@/lib/emails";
import { decrypt } from "@/lib/pwd";
import { prisma } from "@/lib/db";

export type SendEmailInput = {
  token: string;
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  cc?: string;
  bcc?: string;
  attachments?: Array<{
    filename: string;
    content?: string;
    url?: string;
    contentType?: string;
  }>;
};

export type SendEmailResult =
  | { success: true; id: string }
  | { success: false; error: string; statusCode: number };

function isPrivateIp(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "0.0.0.0" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    isPrivate172(hostname) ||
    hostname.startsWith("169.254.") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".home") ||
    hostname.endsWith(".lan")
  );
}

function isPrivate172(hostname: string): boolean {
  if (!hostname.startsWith("172.")) return false;
  const parts = hostname.split(".");
  if (parts.length < 2) return false;
  const second = parseInt(parts[1], 10);
  return second >= 16 && second <= 31;
}

function validateAttachmentUrl(
  url: URL,
  filename: string,
  requestHost?: string,
): string | null {
  if (!["http:", "https:"].includes(url.protocol)) {
    return `Attachment '${filename}' has invalid URL protocol. Only HTTP and HTTPS are allowed.`;
  }

  const hostname = url.hostname.toLowerCase();

  if (isPrivateIp(hostname)) {
    return `Attachment '${filename}' URL is not allowed. Internal/local URLs are blocked for security.`;
  }

  const port = url.port;
  if (
    port &&
    ["21", "22", "23", "25", "53", "110", "143", "993", "995", "3306", "5432", "6379", "8080", "8443"].includes(port)
  ) {
    return `Attachment '${filename}' URL port is not allowed. Internal service ports are blocked for security.`;
  }

  if (requestHost) {
    const currentHost = requestHost.split(":")[0]?.toLowerCase();
    if (currentHost && (hostname === currentHost || hostname.endsWith(`.${currentHost}`))) {
      return `Attachment '${filename}' URL is not allowed. Access to the hosting server is blocked for security.`;
    }
  }

  return null;
}

async function validateAttachments(
  attachments: SendEmailInput["attachments"],
  requestHost?: string,
): Promise<string | null> {
  if (!attachments) return null;
  if (!Array.isArray(attachments)) return "Attachments must be an array.";

  for (let i = 0; i < attachments.length; i++) {
    const attachment = attachments[i];

    if (!attachment.filename) {
      return `Attachment at index ${i} is missing required field 'filename'.`;
    }

    if (!attachment.content && !attachment.url) {
      return `Attachment '${attachment.filename}' must have either 'content' or 'url' field.`;
    }

    if (attachment.content && attachment.url) {
      return `Attachment '${attachment.filename}' cannot have both 'content' and 'url' fields. Use either one.`;
    }

    if (attachment.content) {
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(attachment.content)) {
        return `Attachment '${attachment.filename}' has invalid base64 content.`;
      }
    }

    if (attachment.url) {
      try {
        const url = new URL(attachment.url);
        const urlError = validateAttachmentUrl(url, attachment.filename, requestHost);
        if (urlError) return urlError;
      } catch {
        return `Attachment '${attachment.filename}' has invalid URL format.`;
      }
    }
  }

  return null;
}

async function processAttachments(
  attachments?: SendEmailInput["attachments"],
): Promise<Array<{ filename: string; content: Buffer; contentType?: string }>> {
  if (!attachments) return [];

  return Promise.all(
    attachments.map(async (attachment) => {
      let content: Buffer;

      if (attachment.content) {
        content = Buffer.from(attachment.content, "base64");
      } else if (attachment.url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          const response = await fetch(attachment.url, {
            signal: controller.signal,
            headers: { "User-Agent": "Freesend/1.0" },
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Failed to fetch attachment from URL: ${response.statusText}`);
          }

          const contentLength = response.headers.get("content-length");
          if (contentLength && parseInt(contentLength) > 25 * 1024 * 1024) {
            throw new Error(
              `Attachment file too large: ${Math.round(parseInt(contentLength) / 1024 / 1024)}MB (max 25MB)`,
            );
          }

          content = Buffer.from(await response.arrayBuffer());
        } catch (error) {
          clearTimeout(timeoutId);
          if (error.name === "AbortError") {
            throw new Error("Timeout fetching attachment from URL (30s limit)");
          }
          throw error;
        }
      } else {
        throw new Error(`Attachment '${attachment.filename}' has no content or URL.`);
      }

      return {
        filename: attachment.filename,
        content,
        contentType: attachment.contentType,
      };
    }),
  );
}

export async function sendEmail(
  input: SendEmailInput,
  requestHost?: string,
): Promise<SendEmailResult> {
  // 1. Auth: validate token and get SMTP config
  const smtpConfig = await getSmtpConfigByApiKey(input.token);
  if (!smtpConfig) {
    return { success: false, error: "Invalid API Key or no SMTP configuration found.", statusCode: 403 };
  }

  let status: string;
  try {
    status = await getApiKeyStatus(input.token);
  } catch {
    return { success: false, error: "Invalid API Key.", statusCode: 403 };
  }

  if (status === "inactive") {
    return { success: false, error: "This API key is currently inactive.", statusCode: 400 };
  }

  // 2. Validate required fields
  if (!input.from) {
    return { success: false, error: "Missing required field 'from'.", statusCode: 400 };
  }
  if (!input.to) {
    return { success: false, error: "Missing required field 'to'.", statusCode: 400 };
  }
  if (!input.subject) {
    return { success: false, error: "Missing required field 'subject'.", statusCode: 400 };
  }
  if (!input.text && !input.html) {
    return { success: false, error: "Missing required field 'text' or 'html'.", statusCode: 400 };
  }

  // 3. Validate replyTo
  if (input.replyTo) {
    const emails = input.replyTo.split(",").map((e) => e.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        return { success: false, error: `Invalid 'replyTo' email format: ${email}`, statusCode: 400 };
      }
    }
  }

  // 4. Validate attachments
  const attachmentError = await validateAttachments(input.attachments, requestHost);
  if (attachmentError) {
    return { success: false, error: attachmentError, statusCode: 400 };
  }

  // 5. Resolve API key details (single query instead of double)
  const apiKey = await prisma.apiKey.findUnique({
    where: { token: input.token },
    select: { id: true, tenant_id: true },
  });

  if (!apiKey) {
    return { success: false, error: "API key not found.", statusCode: 403 };
  }

  // 6. Create email record with "pending" status BEFORE sending
  const attachmentString = input.attachments ? JSON.stringify(input.attachments) : undefined;
  const emailRecord = await createEmail(
    apiKey.id,
    apiKey.tenant_id,
    input.from,
    input.to,
    input.subject,
    "pending",
    input.html,
    input.text,
    attachmentString,
    input.cc,
    input.bcc,
    input.replyTo,
  );

  if ("error" in emailRecord) {
    return { success: false, error: "Failed to create email record.", statusCode: 500 };
  }

  // 7. Create transport and send
  const decryptedPassword = decrypt(smtpConfig.pass);
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.security === "SSL",
    auth: {
      user: smtpConfig.user,
      pass: decryptedPassword,
    },
  });

  try {
    const processedAttachments = await processAttachments(input.attachments);

    await transporter.sendMail({
      from: input.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
      cc: input.cc,
      bcc: input.bcc,
      attachments: processedAttachments,
      headers: {
        "X-Mailer": "Freesend",
        "X-Sent-By": "Freesend Email API - https://freesend.metafog.io",
      },
    });

    // 8. Update status to "sent"
    await updateEmailStatus(emailRecord.id, "sent");

    return { success: true, id: emailRecord.id };
  } catch (error) {
    // 9. Update status to "failed"
    await updateEmailStatus(emailRecord.id, "failed");

    console.error("Error sending email:", error);
    return { success: false, error: `Error sending email: ${error.message}`, statusCode: 500 };
  }
}
