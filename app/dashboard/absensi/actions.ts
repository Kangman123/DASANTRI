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

export async function simpanAbsensi(formData: FormData) {
  await requireStaff();
  const tanggal = new Date(formData.get("tanggal") as string);
  const keterangan = formData.get("keterangan") as string;
  const santriIds = (formData.get("santriIds") as string).split(",").filter(Boolean);

  for (const santriId of santriIds) {
    const status = formData.get(`status_${santriId}`) as string;
    const catatan = formData.get(`catatan_${santriId}`) as string;

    await prisma.absensi.upsert({
      where: { santriId_tanggal_keterangan: { santriId, tanggal, keterangan } },
      update: { status: status as any, catatan },
      create: { santriId, tanggal, keterangan, status: status as any, catatan },
    });
  }

  revalidatePath("/dashboard/absensi");
}