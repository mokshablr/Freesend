import { getSmtpConfigByApiKey } from "@/lib/api-key";
import { sendEmail } from "@/lib/send-email";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const OPTIONS = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

type EmailContent = {
  fromName?: string;
  fromEmail: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
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

export const POST = async (req: Request) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Authorization header not found." }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  if (!authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Invalid authorization header. Create a Bearer Token." }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return new Response(
      JSON.stringify({ error: "Invalid or missing API Key." }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  // Auth before body validation so invalid keys get a 403 without the response
  // leaking which body fields are expected.
  const smtpConfig = await getSmtpConfigByApiKey(token);
  if (!smtpConfig) {
    return new Response(
      JSON.stringify({ error: "Invalid API Key or no SMTP configuration found." }),
      { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const body = await req.json();
  const message = body as EmailContent;

  if (!message.fromEmail) {
    return new Response(
      JSON.stringify({ error: "Missing required field 'fromEmail'." }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  // Build from field
  const from = message.fromName
    ? `"${message.fromName}" <${message.fromEmail}>`
    : message.fromEmail;

  const result = await sendEmail(
    {
      token,
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: message.replyTo,
      cc: message.cc,
      bcc: message.bcc,
      attachments: message.attachments,
    },
    req.headers.get("host") || undefined,
  );

  if (result.success) {
    return new Response(
      JSON.stringify({ message: "Email sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  return new Response(
    JSON.stringify({ error: result.error }),
    { status: result.statusCode, headers: { "Content-Type": "application/json", ...corsHeaders } },
  );
};
