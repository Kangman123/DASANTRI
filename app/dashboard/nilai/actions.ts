"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN_LEMBAGA" && session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}

export async function inputNilai(formData: FormData) {
  await requireAdmin();

  await prisma.nilai.upsert({
    where: {
      santriId_mataPelajaranId_semester: {
        santriId: formData.get("santriId") as string,
        mataPelajaranId: formData.get("mataPelajaranId") as string,
        semester: formData.get("semester") as string,
      },
    },
    update: {
      nilai: parseFloat(formData.get("nilai") as string),
    },
    create: {
      santriId: formData.get("santriId") as string,
      mataPelajaranId: formData.get("mataPelajaranId") as string,
      semester: formData.get("semester") as string,
      nilai: parseFloat(formData.get("nilai") as string),
    },
  });

  revalidatePath("/dashboard/nilai");
}