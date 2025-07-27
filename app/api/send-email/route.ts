import nodemailer from "nodemailer";

import { getApiKeyStatus, getSmtpConfigByApiKey } from "@/lib/api-key";
import { createEmail } from "@/lib/emails";
import { decrypt } from "@/lib/pwd";

type emailContent = {
  fromName?: string;
  fromEmail: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content?: string;  // base64 encoded content (optional if url is provided)
    url?: string;      // URL to external file (optional if content is provided)
    contentType?: string;
  }>;
};

export const POST = async (req: Request) => {
  const authHeader = await req.headers.get("authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Authorization header not found." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (!authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({
        error: "Invalid authorization header. Create a Bearer Token.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return new Response(
      JSON.stringify({ error: "Invalid or missing API Key." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const smtpConfig = await getSmtpConfigByApiKey(token);
  if (!smtpConfig) {
    return new Response(
      JSON.stringify({
        error: "Invalid API Key or no SMTP configuration found.",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const status = await getApiKeyStatus(token);
  if (status == "inactive") {
    return new Response(
      JSON.stringify({ error: "This API key is currently inactive." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const sender_data = await req.json();
  const message = <emailContent>sender_data;

  // Build sender field from fromName and fromEmail
  let fromField: string;
  
  if (message.fromEmail) {
    // Use fromName + fromEmail format
    if (message.fromName) {
      fromField = `"${message.fromName}" <${message.fromEmail}>`;
    } else {
      fromField = message.fromEmail;
    }
  } else {
    return new Response(
      JSON.stringify({ error: "Missing required field 'fromEmail'." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  if (!message.to) {
    return new Response(
      JSON.stringify({ error: "Missing required field 'to'." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  if (!message.subject) {
    return new Response(
      JSON.stringify({ error: "Missing required field 'subject'." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  if (!message.text && !message.html) {
    return new Response(
      JSON.stringify({ error: "Missing required field 'text' or 'html'." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Validate attachments if provided
  if (message.attachments) {
    if (!Array.isArray(message.attachments)) {
      return new Response(
        JSON.stringify({ error: "Attachments must be an array." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    for (let i = 0; i < message.attachments.length; i++) {
      const attachment = message.attachments[i];
      
      if (!attachment.filename) {
        return new Response(
          JSON.stringify({ error: `Attachment at index ${i} is missing required field 'filename'.` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (!attachment.content && !attachment.url) {
        return new Response(
          JSON.stringify({ error: `Attachment '${attachment.filename}' must have either 'content' or 'url' field.` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Validate that both content and url are not provided simultaneously
      if (attachment.content && attachment.url) {
        return new Response(
          JSON.stringify({ error: `Attachment '${attachment.filename}' cannot have both 'content' and 'url' fields. Use either one.` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (attachment.content) {
        // Check if content is a valid base64 string
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(attachment.content)) {
          return new Response(
            JSON.stringify({ error: `Attachment '${attachment.filename}' has invalid base64 content.` }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      }

      if (attachment.url) {
        // Validate URL format
        try {
          const url = new URL(attachment.url);
          if (!['http:', 'https:'].includes(url.protocol)) {
            return new Response(
              JSON.stringify({ error: `Attachment '${attachment.filename}' has invalid URL protocol. Only HTTP and HTTPS are allowed.` }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          // Block internal/local URLs to prevent server file access
          const hostname = url.hostname.toLowerCase();
          const port = url.port;
          
          // Block localhost and internal IPs
          if (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '::1' ||
            hostname === '0.0.0.0' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('172.') ||
            hostname.startsWith('169.254.') ||
            hostname.endsWith('.local') ||
            hostname.endsWith('.internal') ||
            hostname.endsWith('.home') ||
            hostname.endsWith('.lan')
          ) {
            return new Response(
              JSON.stringify({ error: `Attachment '${attachment.filename}' URL is not allowed. Internal/local URLs are blocked for security.` }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          // Block common internal ports
          if (port && ['21', '22', '23', '25', '53', '80', '110', '143', '443', '993', '995', '3306', '5432', '6379', '8080', '8443'].includes(port)) {
            return new Response(
              JSON.stringify({ error: `Attachment '${attachment.filename}' URL port is not allowed. Internal service ports are blocked for security.` }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          // Block file:// protocol attempts (should be caught by protocol check, but extra safety)
          if (url.protocol === 'file:') {
            return new Response(
              JSON.stringify({ error: `Attachment '${attachment.filename}' URL protocol is not allowed. File system access is blocked for security.` }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          // Block access to the same server where Freesend is hosted
          const currentHost = req.headers.get('host')?.split(':')[0]?.toLowerCase();
          if (currentHost && (hostname === currentHost || hostname.endsWith(`.${currentHost}`))) {
            return new Response(
              JSON.stringify({ error: `Attachment '${attachment.filename}' URL is not allowed. Access to the hosting server is blocked for security.` }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

        } catch (error) {
          return new Response(
            JSON.stringify({ error: `Attachment '${attachment.filename}' has invalid URL format.` }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      }
    }
  }

  const decryptedPassword = decrypt(smtpConfig.pass);
  // Create a transporter object using the SMTP server details
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.security === "SSL", // Use SSL if the security is set to 'SSL'
    auth: {
      user: smtpConfig.user,
      pass: decryptedPassword,
    },
  });

  if (!transporter) {
    return new Response(
      JSON.stringify({ error: "Could not create the transporter object." }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    // Process attachments to decode base64 content or fetch from URLs
    const processedAttachments = await Promise.all(
      message.attachments?.map(async (attachment) => {
        try {
          let content: Buffer;
          if (attachment.content) {
            // Decode base64 content to Buffer
            content = Buffer.from(attachment.content, 'base64');
          } else if (attachment.url) {
            // Download content from URL and convert to Buffer
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            try {
              const response = await fetch(attachment.url, {
                signal: controller.signal,
                headers: {
                  'User-Agent': 'Freesend/1.0'
                }
              });
              clearTimeout(timeoutId);
              
              if (!response.ok) {
                throw new Error(`Failed to fetch attachment from URL: ${response.statusText}`);
              }
              
              // Check content length to prevent large file downloads
              const contentLength = response.headers.get('content-length');
              if (contentLength && parseInt(contentLength) > 25 * 1024 * 1024) { // 25MB limit
                throw new Error(`Attachment file too large: ${Math.round(parseInt(contentLength) / 1024 / 1024)}MB (max 25MB)`);
              }
              
              content = Buffer.from(await response.arrayBuffer());
            } catch (error) {
              clearTimeout(timeoutId);
              if (error.name === 'AbortError') {
                throw new Error(`Timeout fetching attachment from URL (30s limit)`);
              }
              throw error;
            }
          } else {
            // This case should ideally be caught by the validation above, but as a fallback
            throw new Error(`Attachment '${attachment.filename}' has no content or URL.`);
          }

          return {
            filename: attachment.filename,
            content: content,
            contentType: attachment.contentType,
          };
        } catch (error) {
          throw new Error(`Error processing attachment '${attachment.filename}': ${error.message}`);
        }
      }) || []
    );

    await transporter.sendMail({
      from: fromField,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: processedAttachments,
      headers: {
        'X-Mailer': 'Freesend',
        'X-Sent-By': 'Freesend Email API - https://freesend.metafog.io'
      }
    });
    const attachmentString = JSON.stringify(message.attachments);
    await createEmail(
      token,
      fromField,
      message.to,
      message.subject,
      message.html,
      message.text,
      attachmentString,
    );

    return new Response(
      JSON.stringify({ message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: `Error sending email: ${error.message}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
