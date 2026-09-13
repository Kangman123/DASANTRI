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

export async function createKelas(formData: FormData) {
  await requireAdmin();
  await prisma.kelas.create({
    data: {
      name: formData.get("name") as string,
      unitId: formData.get("unitId") as string,
    },
  });
  revalidatePath("/dashboard/kelas");
}

export async function deleteKelas(id: string) {
  await requireAdmin();
  await prisma.kelas.delete({ where: { id } });
  revalidatePath("/dashboard/kelas");
}