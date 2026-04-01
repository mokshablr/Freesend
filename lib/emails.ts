"use server";

import { Emails } from "@prisma/client";

import { prisma } from "@/lib/db";

import { getCurrentUser } from "./session";

export const createEmail = async (
  apiKeyId: string,
  tenantId: string,
  from: string,
  to: string,
  subject: string,
  status: string = "pending",
  html?: string,
  text?: string,
  attachments?: string,
  cc?: string,
  bcc?: string,
  replyTo?: string,
) => {
  try {
    const newEmail = await prisma.emails.create({
      data: {
        apiKeyId: apiKeyId,
        tenant_id: tenantId,
        from: from,
        to: to,
        subject: subject,
        status: status,
        text_body: text || undefined,
        html_body: html || undefined,
        attachments_metadata: attachments || undefined,
        cc: cc || undefined,
        bcc: bcc || undefined,
        reply_to: replyTo || undefined,
      },
    });
    return newEmail;
  } catch (error) {
    console.error("Error creating email:", error);
    return { error: error.message };
  }
};

export const updateEmailStatus = async (id: string, status: string) => {
  try {
    const updated = await prisma.emails.update({
      where: { id },
      data: { status },
    });
    return updated;
  } catch (error) {
    console.error("Error updating email status:", error);
    return { error: error.message };
  }
};

export const getAllEmailsByTenant = async (): Promise<Emails[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const rows = await prisma.emails.findMany({
      where: {
        tenant_id: user.tenant_id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return rows;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getEmailsByTenant = async (
  cursor?: string,
  pageSize: number = 50,
): Promise<{ data: Emails[]; nextCursor: string | null }> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const rows = await prisma.emails.findMany({
      where: {
        tenant_id: user.tenant_id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    });

    const hasMore = rows.length > pageSize;
    const data = hasMore ? rows.slice(0, pageSize) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, nextCursor };
  } catch (error) {
    console.log(error);
    return { data: [], nextCursor: null };
  }
};
