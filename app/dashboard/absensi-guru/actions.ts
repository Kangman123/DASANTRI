"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN_LEMBAGA" && session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: hanya kepala sekolah/admin yang boleh mengisi absensi guru");
  }
  return session;
}

export async function simpanAbsensiGuru(formData: FormData) {
  await requireAdmin();
  const tanggal = new Date(formData.get("tanggal") as string);
  const keterangan = formData.get("keterangan") as string;
  const userIds = (formData.get("userIds") as string).split(",").filter(Boolean);

  for (const userId of userIds) {
    const status = formData.get(`status_${userId}`) as string;
    const catatan = formData.get(`catatan_${userId}`) as string;

    await prisma.absensiGuru.upsert({
      where: { userId_tanggal_keterangan: { userId, tanggal, keterangan } },
      update: { status: status as any, catatan },
      create: { userId, tanggal, keterangan, status: status as any, catatan },
    });
  }

  revalidatePath("/dashboard/absensi-guru");
}