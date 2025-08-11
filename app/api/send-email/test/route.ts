import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { getSmtpConfigById } from "@/lib/smtp-config";
import { decrypt } from "@/lib/pwd";
import { getCurrentUser } from "@/lib/session";

// Force dynamic rendering since this route uses authentication
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { mailServerId, recipient, config } = await req.json();
    let smtpConfig;
    if (mailServerId) {
      smtpConfig = await getSmtpConfigById(mailServerId);
      if (!smtpConfig) {
        return new Response(JSON.stringify({ error: "Mail server not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      smtpConfig = {
        ...smtpConfig,
        pass: decrypt(smtpConfig.pass),
      };
    } else if (config) {
      smtpConfig = config;
    } else {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.security === "SSL",
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });
    await transporter.sendMail({
      from: smtpConfig.user,
      to: recipient,
      subject: "Freesend SMTP Test Email: It works!",
      text: `Hello from Freesend!\n\nThis is a test email to confirm that your SMTP settings are working perfectly.\n\nSender: ${smtpConfig.user}\nServer: ${smtpConfig.host}:${smtpConfig.port}\n\nIf you're seeing this, you're all set to start sending emails from your server through Freesend!\n\nTo start sending actual emails, check out our API guide:\nhttps://freesend.metafog.io/docs/api/send-email\n`,
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