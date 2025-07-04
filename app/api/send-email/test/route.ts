import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { getSmtpConfigById } from "@/lib/smtp-config";
import { decrypt } from "@/lib/pwd";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { mailServerId, recipient } = await req.json();
    if (!mailServerId || !recipient) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const smtpConfig = await getSmtpConfigById(mailServerId);
    if (!smtpConfig) {
      return new Response(JSON.stringify({ error: "Mail server not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
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
    await transporter.sendMail({
      from: smtpConfig.user,
      to: recipient,
      subject: "Freesend SMTP Test Email: It works!",
      text: `Hello from Freesend!

This is a test email to confirm that your SMTP settings are working perfectly.

Sender: ${smtpConfig.user}
Server: ${smtpConfig.host}:${smtpConfig.port}

If you're seeing this, you're all set to start sending emails from your server through Freesend!

To start sending actual emails, check out our API guide:
https://freesend.metafog.io/docs/api/send-email
`,
    });
    return new Response(JSON.stringify({ message: "Test email sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to send test email" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 