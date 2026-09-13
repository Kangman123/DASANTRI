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

export async function createKegiatan(formData: FormData) {
  const session = await requireAdmin();
  const institutionId =
    session.user.role === "SUPER_ADMIN"
      ? (formData.get("institutionId") as string)
      : session.user.institutionId!;

  await prisma.kegiatan.create({
    data: {
      name: formData.get("name") as string,
      hari: formData.get("hari") as string,
      institutionId,
    },
  });
  revalidatePath("/dashboard/kurikulum-kegiatan");
}

export async function deleteKegiatan(id: string) {
  await requireAdmin();
  await prisma.kegiatan.delete({ where: { id } });
  revalidatePath("/dashboard/kurikulum-kegiatan");
}