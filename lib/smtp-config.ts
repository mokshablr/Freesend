"use server";

import { revalidatePath } from "next/cache";
import { NumericCellType } from "handsontable/cellTypes";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

async function convertToArray(rows) {
  //DATA ARRAY
  let dataRows = new Array(rows.length);
  for (var i = 0; i < rows.length; i++) {
    let row = rows[i];
    dataRows[i] = [
      row.id,
      row.tenant_id,
      row.name,
      row.host,
      row.port,
      row.security,
      row.user,
      row.pass,
      row.created_at,
      row.updated_at,
      row.tenant,
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

export const createServer = async (data) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    // prisma create server entry here
    const tenant_id = user.tenant_id;
    const { name, host, port, security, user: username, pass } = data;

    if (
      !tenant_id ||
      !name ||
      !host ||
      !port ||
      !security ||
      !username ||
      !pass
    ) {
      throw new Error("Missing required fields");
    }

    const newSmtpConfig = await prisma.smtpConfig.create({
      data: {
        tenant_id: tenant_id,
        name: name,
        host: host,
        port: port,
        security: security,
        user: username,
        pass: pass,
      },
    });
    return newSmtpConfig;
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
};

export const getServersByTenant: () => Promise<
  {
    id: string;
    name: string;
    host: string;
    port: number;
    user: string;
    security: string;
  }[]
> = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const rows = await prisma.smtpConfig.findMany({
      select: {
        id: true,
        name: true,
        host: true,
        port: true,
        user: true,
        security: true,
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

export const deleteServer = async (id: string) => {
  try {
    const deletedMailServer = await prisma.smtpConfig.delete({
      where: { id: id },
    });
    return deletedMailServer;
  } catch (error) {
    console.error("Error deleting API key:", error);
    throw error;
  }
};

export const updateMailServer = async (
  mailServerId: string,
  updateData: {
    name?: string;
    host?: string;
    port?: number;
    security?: string;
    user?: string;
    pass?: string;
  },
) => {
  try {
    const updatedMailServer = await prisma.smtpConfig.update({
      where: { id: mailServerId },
      data: updateData,
    });
    return updatedMailServer;
  } catch (error) {
    console.error("Error updating mail server:", error);
    throw error;
  }
};
