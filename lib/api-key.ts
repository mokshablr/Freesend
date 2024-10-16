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

export async function searchServers(
  stxt: string,
  page: number,
  pageSize: number,
): Promise<any[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const rows = await prisma.smtpConfig.findMany({
      where: {
        // deleted: false,
        tenant_id: user.tenant_id,
        OR: [
          {
            name: {
              contains: stxt || "",
              mode: "insensitive",
            },
          },
          //   {
          //     sector: {
          //       name: {
          //         contains: stxt || '',
          //         mode: 'insensitive'
          //       },
          //     },
          //   },
        ],
      },
      //   include: {
      //     sector: true,
      //   },
      orderBy: [
        {
          createdAt: "asc",
        },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return convertToArray(rows);
  } catch (error) {
    console.log(error);
    return [];
  }
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

    console.log("hi", tenant_id, name, token, smtpConfigId);

    if (!tenant_id || !name || !token || !smtpConfigId) {
      throw new Error("Missing required fields");
    }

    const newApiKey = await prisma.APIKey.create({
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
    const rows = await prisma.APIKey.findMany({
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
  apiKey: string,
): Promise<SmtpConfig | null> => {
  try {
    const row = await prisma.APIKey.findFirst({
      select: {
        smtpConfig: true,
      },
      where: {
        token: apiKey,
      },
    });
    if (!row) return null;
    return row.smtpConfig;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getServerNames = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const rows = await prisma.smtpConfig.findMany({
      select: {
        name: true, // Only select the 'name' field
      },
      where: {
        tenant_id: user.tenant_id,
      },
      orderBy: [
        {
          name: "asc",
        },
      ],
    });

    let names = new Array(rows.length);
    for (var i = 0; i < rows.length; i++) {
      let row = rows[i];
      names[i] = row.name;
    }

    return names;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getServerIdFromName = async (name: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const row = await prisma.smtpConfig.findFirst({
      where: {
        name: name,
        tenant_id: user.tenant_id,
      },
    });
    if (!row) return null;
    return row.id;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getServerNameFromId = async (id: string | null) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    if (id == null) return "";

    const row = await prisma.smtpConfig.findFirst({
      where: {
        id: id,
        tenant_id: user.tenant_id,
      },
    });

    return row?.name;
  } catch (error) {
    console.log(error);
    return "";
  }
};
