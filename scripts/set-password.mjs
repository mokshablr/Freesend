// Create a local-login user or reset a password.
//   node scripts/set-password.mjs <email> <password>
//   docker compose exec app node scripts/set-password.mjs <email> <password>
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error("usage: set-password.mjs <email> <password>");
  process.exit(1);
}

const prisma = new PrismaClient();
const data = { password: await bcrypt.hash(password, 10) };
const user = await prisma.user.upsert({
  where: { email: email.toLowerCase() },
  update: data,
  create: { email: email.toLowerCase(), name: email.split("@")[0], ...data },
});
console.log(`password set for ${user.email} (${user.role})`);
await prisma.$disconnect();
