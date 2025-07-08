import nodemailer from "nodemailer";

import { getApiKeyStatus, getSmtpConfigByApiKey } from "@/lib/api-key"; // Ensure this import is correct
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
    content?: string;  // base64 encoded content
    path?: string;     // file path (for server-side files)
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
    await transporter.sendMail({
      from: fromField,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: message.attachments,
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
    return new Response(
      JSON.stringify({ error: `Error sending email: ${error.message}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
