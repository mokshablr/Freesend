import { compare } from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";

export default {
  providers: [
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true, //IMPORTANT
          }),
        ]
      : []),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = String(credentials.email ?? "").toLowerCase();
        const password = String(credentials.password ?? "");
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password || !user.isActive) return null;
        return (await compare(password, user.password)) ? user : null;
      },
    }),
    // Resend({
    //   apiKey: env.RESEND_API_KEY,
    //   from: env.EMAIL_FROM,
    //   sendVerificationRequest,
    // }),
  ],
} satisfies NextAuthConfig;
