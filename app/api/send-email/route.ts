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
    content: string;  // base64 encoded content (required)
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

      if (!attachment.content) {
        return new Response(
          JSON.stringify({ error: `Attachment '${attachment.filename}' must have 'content' field with base64 encoded data.` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Validate base64 content if provided
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
    // Process attachments to decode base64 content
    const processedAttachments = message.attachments?.map(attachment => {
      try {
        // Decode base64 content to Buffer
        return {
          filename: attachment.filename,
          content: Buffer.from(attachment.content, 'base64'),
          contentType: attachment.contentType,
        };
      } catch (error) {
        throw new Error(`Invalid base64 content for attachment '${attachment.filename}': ${error.message}`);
      }
    });

    await transporter.sendMail({
      from: fromField,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: processedAttachments,
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
