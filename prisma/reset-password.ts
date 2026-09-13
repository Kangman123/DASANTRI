import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  const email = "admin1@gmail.com";
  const passwordBaru = "admin123"; // ganti sesuai password yang kamu mau

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("User dengan email itu tidak ditemukan.");
    return;
  }

  const account = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });
  if (!account) {
    console.log("Akun credential tidak ditemukan untuk user ini.");
    return;
  }

  const hashed = await hashPassword(passwordBaru);

  await prisma.account.update({
    where: { id: account.id },
    data: { password: hashed },
  });

  console.log(`Password untuk ${email} berhasil direset ke: ${passwordBaru}`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());