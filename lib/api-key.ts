"use server";

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
        id: true,
        name: true,
        token: true,
        status: true,
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

export const getSmtpConfigByApiKey = async (ApiKey: string) => {
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
    console.log("Error getting SMTP Config by API Key:", error);
    return null;
  }
};

export const updateApiKeyName = async (apiKeyId: string, newName: string) => {
  try {
    const updatedApiKey = await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { name: newName },
    });
    return updatedApiKey;
  } catch (error) {
    console.error("Error updating API key name:", error);
    throw error;
  }
};

export const deleteApiKey = async (id: string) => {
  try {
    const deletedApiKey = await prisma.apiKey.delete({
      where: { id: id },
    });
    return deletedApiKey;
  } catch (error) {
    console.error("Error deleting API key:", error);
    throw error;
  }
};

export const toggleApiKeyStatus = async (apiKeyId: string) => {
  try {
    // Retrieve the current status of the API key
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: apiKeyId },
    });

    if (!apiKey) {
      throw new Error("API key not found");
    }

    // Determine the new status
    const newStatus = apiKey.status === "active" ? "inactive" : "active";

    // Update the status of the API key
    const updatedApiKey = await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { status: newStatus },
    });

    return updatedApiKey.status;
  } catch (error) {
    console.error("Error toggling API key status:", error);
    throw error;
  }
};

export const getApiKeyStatus = async (apiKeyToken: string) => {
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { token: apiKeyToken },
    });

    if (!apiKey) {
      throw new Error("API key not found");
    }
    return apiKey.status;
  } catch (error) {
    console.error("Error fetching API key status:", error);
    throw error;
  }
};
