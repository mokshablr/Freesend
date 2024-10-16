"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { tenantNameSchema } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";

export type FormData = {
  name: string;
};

export async function updateTenantName(tenant_id: string, data: FormData) {
  try {
    const { name } = tenantNameSchema.parse(data);

    // Update the user name.
    await prisma.tenant.update({
      where: {
        id: tenant_id,
      },
      data: {
        name: name,
      },
    })

    revalidatePath('/settings');
    return { status: "success" };
  } catch (error) {
    console.log(error)
    return { status: error.toString() }
  }
}