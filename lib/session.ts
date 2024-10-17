import "server-only";

import { auth } from "@/auth";

export const getCurrentUser = async () => {
  const session = await auth();
  if (!session?.user) {
    return undefined;
  }
  return session.user;
};
