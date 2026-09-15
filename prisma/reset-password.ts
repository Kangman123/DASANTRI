import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  const email = "mubadzam@gmail.com"; // ganti kalau mau reset email lain
  const passwordBaru = "Niatyangbaik123"; // ganti dengan password baru yang kamu mau

  console.log(`Mencari user dengan email: ${email}`);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log("❌ User tidak ditemukan sama sekali.");
    return;
  }

  console.log(`✔ User ditemukan. Role: ${user.role}, ID: ${user.id}`);

  const accounts = await prisma.account.findMany({ where: { userId: user.id } });
  console.log(`Ditemukan ${accounts.length} akun terhubung ke user ini:`);
  accounts.forEach((a) => console.log(`  - providerId: ${a.providerId}, id: ${a.id}`));

  const credentialAccount = accounts.find((a) => a.providerId === "credential");

  if (!credentialAccount) {
    console.log("❌ Tidak ada akun 'credential' (login email/password) untuk user ini.");
    console.log("Membuat akun credential baru...");
    const hashed = await hashPassword(passwordBaru);
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: hashed,
      },
    });
    console.log(`✔ Akun credential baru dibuat dengan password: ${passwordBaru}`);
    return;
  }

  const hashed = await hashPassword(passwordBaru);
  await prisma.account.update({
    where: { id: credentialAccount.id },
    data: { password: hashed },
  });

  console.log(`✔ Password berhasil direset untuk ${email} menjadi: ${passwordBaru}`);
}

main()
  .catch((e) => console.error("Terjadi error:", e))
  .finally(() => prisma.$disconnect());