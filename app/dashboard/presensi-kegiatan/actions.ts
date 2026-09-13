"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (!["ADMIN_LEMBAGA", "SUPER_ADMIN", "USTADZ"].includes(session.user.role as string)) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function simpanPresensiKegiatan(formData: FormData) {
  await requireStaff();
  const kegiatanId = formData.get("kegiatanId") as string;
  const tanggal = new Date(formData.get("tanggal") as string);
  const santriIds = (formData.get("santriIds") as string).split(",").filter(Boolean);

  for (const santriId of santriIds) {
    const status = formData.get(`status_${santriId}`) as string;
    const catatan = formData.get(`catatan_${santriId}`) as string;
    const nilai = formData.get(`nilai_${santriId}`) as string;

    await prisma.presensiKegiatan.upsert({
      where: { kegiatanId_santriId_tanggal: { kegiatanId, santriId, tanggal } },
      update: { status: status as any, catatan, nilai },
      create: { kegiatanId, santriId, tanggal, status: status as any, catatan, nilai },
    });
  }

  revalidatePath("/dashboard/presensi-kegiatan");
}