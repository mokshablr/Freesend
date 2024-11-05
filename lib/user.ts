"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

async function convertToArray(rows) {
  //DATA ARRAY
  let dataRows = new Array(rows.length);
  for (var i = 0; i < rows.length; i++) {
    let row = rows[i];
    dataRows[i] = [
      row.id,
      row.name,
      row.email,
      row.quotaMonth,
      row.quotaYear,
      row.isActive,
      row.role,
    ];
  }
  return dataRows;
}

export const getTenant = async (user) => {
  if (!user) return null;
  if (!user.tenant_id) return null;

  try {
    //check if tenant row exist

    //console.log("checking tenant ", user.tenant_id)
    var tenant = await prisma.tenant.findUnique({
      where: {
        id: user.tenant_id,
      },
    });

    if (tenant) return tenant;

    //create tenant
    tenant = await prisma.tenant.create({
      data: {
        id: user.tenant_id,
        name: "",
      },
    });

    //console.log("tenant created ", tenant.id)

    return tenant;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const row = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    return row;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    return user;
  } catch {
    return null;
  }
};

export async function searchUsers(
  stxt: string,
  page: number,
  pageSize: number,
): Promise<any[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const rows = await prisma.user.findMany({
      where: {
        tenant_id: user.tenant_id,
        name: {
          contains: stxt || "", // Return all rows if no search
          mode: "insensitive", // Ignore case
        },
      },
      orderBy: [
        {
          createdAt: "desc",
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

export const getUserNames = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const rows = await prisma.user.findMany({
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

export const getUserIdFromName = async (name: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const row = await prisma.user.findFirst({
      where: {
        name: name,
        tenant_id: user.tenant_id,
      },
    });
    return row?.id;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getUserNameFromId = async (id: string | null) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    if (id == null) return "";

    const row = await prisma.user.findFirst({
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

export const isCurrentUserActive = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const row = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });

    return row?.isActive;
  } catch (error) {
    console.log(error);
    return false;
  }
};

async function isDuplicate(email: string, recId: string) {
  const u = await getUserByEmail(email);
  if (!u) return false; //good
  return u.id != recId;
}

export async function updateUser(editedRecords) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const tenant = await getTenant(user);

    for (var i = 0; i < editedRecords.length; i++) {
      let row = editedRecords[i];
      if (!row || row.length < 2 || row[1] == null) continue;

      if (!row[2]) {
        return { status: "validation", reason: "Email is mandatory" };
      }

      let recId = row[0];

      const email = row[2];
      const dup = await isDuplicate(email, recId);
      if (dup) {
        return {
          status: "validation",
          reason: "Email " + email + " is already in use.",
        };
      }

      var role = row[6];
      if (!role) {
        role = UserRole.USER;
      }

      var active = false;
      if (row[5]) active = true;

      if (user.id === recId && user.role === UserRole.ADMIN) {
        role = UserRole.ADMIN; //Admin cant change self to USER
        active = true; //forced
      }

      var qM = 0;
      var qY = 0;
      if (row[3]) qM = row[3];
      if (row[4]) qY = row[4];

      if (recId) {
        //update
        await prisma.user.update({
          where: {
            id: recId,
          },
          data: {
            name: row[1].trim(),
            email: email,
            isActive: active,
            role: role,
          },
        });
      } else {
        //insert
        //shouldnt come here
      }
    }

    revalidatePath("/users");
    return { status: "success" };
  } catch (error) {
    console.log(error);
    return { status: "error", reason: error.toString() };
  }
}

export async function createUser(data) {
  try {
    const name = data.name;
    const email = data.email;
    const role = data.role;

    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    if (!name) {
      return { status: "validation", reason: "Name is mandatory" };
    }
    if (!email) {
      return { status: "validation", reason: "Email is mandatory" };
    }
    if (!role) {
      return { status: "validation", reason: "Role is mandatory" };
    }

    const dup = await isDuplicate(email, "");
    if (dup) {
      return {
        status: "validation",
        reason: "Email " + email + " is already in use.",
      };
    }

    const tenant = await getTenant(user);

    const newUser = await prisma.user.create({
      data: {
        tenant_id: user.tenant_id, //same tenant
        name: name.trim(),
        email: email,
        isActive: true,
        role: role,
      },
    });

    //send invite email
    // await sendInviteEmail(newUser, tenant);

    return { status: "success" };
  } catch (error) {
    console.log(error);
    return { status: "error", reason: error.toString() };
  }
}
