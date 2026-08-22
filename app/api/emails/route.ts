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

type ResendEmailRequest = {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  reply_to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename?: string;
    content?: string;
    contentType?: string;
  }>;
};

function normalizeToString(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

function parseFromField(from: string): { name?: string; address: string } {
  // Handle "Name <email>" format
  const match = from.match(/^"?([^"<]*)"?\s*<([^>]+)>$/);
  if (match) {
    const name = match[1].trim();
    return { name: name || undefined, address: match[2].trim() };
  }
  // Bare email address
  return { address: from.trim() };
}

export const POST = async (req: Request) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ statusCode: 400, name: "missing_authorization", message: "Authorization header not found." }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  if (!authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ statusCode: 400, name: "invalid_authorization", message: "Invalid authorization header." }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return new Response(
      JSON.stringify({ statusCode: 400, name: "missing_api_key", message: "Invalid or missing API Key." }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  // Auth before body validation so invalid keys get a 403 without the response
  // leaking which body fields are expected.
  const smtpConfig = await getSmtpConfigByApiKey(token);
  if (!smtpConfig) {
    return new Response(
      JSON.stringify({ statusCode: 403, name: "invalid_api_key", message: "Invalid API Key or no SMTP configuration found." }),
      { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  let body: ResendEmailRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ statusCode: 400, name: "invalid_request", message: "Invalid JSON body." }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  if (!body.from) {
    return new Response(
      JSON.stringify({ statusCode: 422, name: "validation_error", message: "Missing required field 'from'." }),
      { status: 422, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  // Parse the "from" field (Resend format: "Name <email>" or bare email)
  const parsed = parseFromField(body.from);
  const from = parsed.name
    ? `"${parsed.name}" <${parsed.address}>`
    : parsed.address;

  // Normalize array fields to comma-separated strings
  const to = normalizeToString(
    Array.isArray(body.to) ? body.to : body.to ? [body.to] : undefined,
  );
  const cc = normalizeToString(body.cc);
  const bcc = normalizeToString(body.bcc);
  const replyTo = normalizeToString(body.reply_to);

  // Map attachments
  const attachments = body.attachments?.map((a) => ({
    filename: a.filename || "attachment",
    content: a.content,
    contentType: a.contentType,
  }));

  const result = await sendEmail(
    {
      token,
      from,
      to: to || "",
      subject: body.subject,
      html: body.html,
      text: body.text,
      replyTo,
      cc,
      bcc,
      attachments,
    },
    req.headers.get("host") || undefined,
  );

  if (result.success) {
    return new Response(
      JSON.stringify({ id: result.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  return new Response(
    JSON.stringify({ statusCode: result.statusCode, name: "error", message: result.error }),
    { status: result.statusCode, headers: { "Content-Type": "application/json", ...corsHeaders } },
  );
};
