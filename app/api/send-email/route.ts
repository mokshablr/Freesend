import { stat } from "fs";
import { send } from "process";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

import { getApiKeyStatus, getSmtpConfigByApiKey } from "@/lib/api-key"; // Ensure this import is correct

export const POST = async (req: Request, res: Response) => {
  const authHeader = await req.headers.get("authorization");
  if (!authHeader) {
    return new Response("Authorization header not found.", {
      status: 400,
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return new Response(
      "Invalid authorization header. Create a Bearer Token.",
      {
        status: 400,
      },
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return new Response("Invalid or missing API Key.", {
      status: 400,
    });
  }

  const smtpConfig = await getSmtpConfigByApiKey(token);
  if (!smtpConfig) {
    return new Response("Invalid API Key or no SMTP configuration found.", {
      status: 403,
    });
  }

  const status = await getApiKeyStatus(token);
  if (status == "inactive") {
    return new Response("This API key is currently inactive.", {
      status: 400,
    });
  }

  const sender_data = await req.json();
  const { from, to, subject, text, html } = sender_data;
  if (!from) {
    return new Response("Missing required field 'from'. ", {
      status: 400,
    });
  }
  if (!to) {
    return new Response("Missing required field 'to'. ", {
      status: 400,
    });
  }
  if (!subject) {
    return new Response("Missing required field 'subject'. ", {
      status: 400,
    });
  }
  if (!from && !html) {
    return new Response("Missing required field 'text' or 'html. ", {
      status: 400,
    });
  }

  // Create a transporter object using the SMTP server details
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.security === "SSL", // Use SSL if the security is set to 'SSL'
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });

  if (!transporter) {
    return new Response("Could not create the transporter object.", {
      status: 502,
    });
  }

  try {
    await transporter.sendMail({
      from, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    return new Response("Email sent successfully", { status: 200 });
    // return new Response(JSON.stringify({smtpConfig:jsonRes}), {status:200})
    // return res.status(200).json({ message: jsonRes });
  } catch (error) {
    return new Response(`Error sending email: ${error.message}`, {
      status: 500,
    });
  }
};
