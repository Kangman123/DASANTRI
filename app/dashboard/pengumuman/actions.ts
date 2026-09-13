"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createPengumuman(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN_LEMBAGA" && session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }

  const institutionId =
    session.user.role === "SUPER_ADMIN"
      ? (formData.get("institutionId") as string)
      : session.user.institutionId!;

  await prisma.pengumuman.create({
    data: {
      judul: formData.get("judul") as string,
      isi: formData.get("isi") as string,
      institutionId,
    },
  });
  revalidatePath("/dashboard/pengumuman");
}

export async function deletePengumuman(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN_LEMBAGA" && session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  await prisma.pengumuman.delete({ where: { id } });
  revalidatePath("/dashboard/pengumuman");
}