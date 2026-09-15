import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
  trustedOrigins: [
    "http://localhost:3000",
    "http://192.168.1.4:3000",
    "https://database-santri.vercel.app",
  ],
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "WALI_SANTRI" },
      institutionId: { type: "string", required: false },
      nip: { type: "string", required: false },
      jenisKelamin: { type: "string", required: false },
      tempatLahir: { type: "string", required: false },
      tanggalLahir: { type: "string", required: false },
      alamat: { type: "string", required: false },
    },
  },
});
