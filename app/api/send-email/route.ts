import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/send-email";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  // Without this, browser clients can see a 429 status but cannot read
  // Retry-After or any RateLimit-* header from the response.
  "Access-Control-Expose-Headers":
    "RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, Retry-After",
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

  // Rate limit before parsing the body. The token is not verified against the
  // database yet, which is deliberate: a refused request then costs one hash
  // and one map lookup, with no database round trip and no buffering of a body
  // that may carry megabytes of base64 attachments.
  const rateLimit = checkRateLimit(token);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please retry later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          ...rateLimitHeaders(rateLimit),
        },
      },
    );
  }

  const body = await req.json();
  const message = body as EmailContent;

  if (!message.fromEmail) {
    return new Response(
      JSON.stringify({ error: "Missing required field 'fromEmail'." }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders, ...rateLimitHeaders(rateLimit) } },
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
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders, ...rateLimitHeaders(rateLimit) } },
    );
  }

  return new Response(
    JSON.stringify({ error: result.error }),
    { status: result.statusCode, headers: { "Content-Type": "application/json", ...corsHeaders, ...rateLimitHeaders(rateLimit) } },
  );
};
