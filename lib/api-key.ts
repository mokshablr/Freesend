"use server";

import { revalidatePath } from "next/cache";
import { SmtpConfig } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

import { generateApiKey } from "./apiKeyUtil";

async function convertToArray(rows) {
  //DATA ARRAY
  let dataRows = new Array(rows.length);
  for (var i = 0; i < rows.length; i++) {
    let row = rows[i];
    dataRows[i] = [
      row.id,
      row.tenant_id,
      row.name,
      row.token,
      row.tenant,
      row.created_at,
      row.updated_at,
    ];
  }

  return dataRows;
}

export const createApiKey = async (data) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    // prisma create server entry here
    const tenant_id = user.tenant_id;
    const token = generateApiKey();
    const { name, smtpConfigId } = data;

    if (!tenant_id || !name || !token || !smtpConfigId) {
      throw new Error("Missing required fields");
    }

    const newApiKey = await prisma.apiKey.create({
      data: {
        tenant_id: tenant_id,
        name: name,
        token: token,
        smtpConfigId: smtpConfigId,
      },
    });
    return newApiKey;
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
};

export const getApiKeysByTenant = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    const rows = await prisma.apiKey.findMany({
      select: {
        name: true,
        token: true,
        createdAt: true,
        smtpConfig: true,
        // status: true,
      },
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

export const getSmtpConfigByApiKey = async (
  ApiKey: string,
): Promise<SmtpConfig | null> => {
  try {
    const row = await prisma.apiKey.findFirst({
      select: {
        smtpConfig: true,
      },
      where: {
        token: ApiKey,
      },
    });
    if (!row) return null;
    return row.smtpConfig;
  } catch (error) {
    console.log(error);
    return null;
  }
};
