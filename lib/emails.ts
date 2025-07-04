"use server";

import { Emails } from "@prisma/client";

import { prisma } from "@/lib/db";

import { getTenantIdByApiKey } from "./api-key";
import { getCurrentUser } from "./session";

export const createEmail = async (
  token: string,
  from: string,
  to: string,
  subject: string,
  html?: string,
  text?: string,
  attachments?: string,
) => {
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { token },
    });

    if (!apiKey) {
      throw new Error("API key not found");
    }

    const tenant_id = await getTenantIdByApiKey(token);
    if (!tenant_id) {
      throw new Error("Tenant Id not found");
    }

    const newEmail = await prisma.emails.create({
      data: {
        apiKeyId: apiKey.id,
        tenant_id: tenant_id,
        from: from,
        to: to,
        subject: subject,
        text_body: text || undefined,
        html_body: html || undefined,
        attachments_metadata: attachments || undefined,
      },
    });
    return newEmail;
  } catch (error) {
    console.error("Error creating email:", error);
    return { error: error.message };
  }
};

export const getEmailsByTenant: () => Promise<Emails[]> = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const rows = await prisma.emails.findMany({
      where: {
        tenant_id: user.tenant_id,
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });
    return rows;
  } catch (error) {
    console.log(error);
    return [];
  }
};
