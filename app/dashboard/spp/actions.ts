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

export async function generateTagihan(formData: FormData) {
  const session = await requireAdmin();
  const bulan = parseInt(formData.get("bulan") as string);
  const tahun = parseInt(formData.get("tahun") as string);
  const nominal = parseFloat(formData.get("nominal") as string);
  const institutionId =
    session.user.role === "SUPER_ADMIN"
      ? (formData.get("institutionId") as string)
      : session.user.institutionId!;

  const santris = await prisma.santri.findMany({ where: { institutionId } });

  for (const s of santris) {
    await prisma.tagihan.upsert({
      where: { santriId_bulan_tahun: { santriId: s.id, bulan, tahun } },
      update: {},
      create: { santriId: s.id, bulan, tahun, nominal },
    });
  }

  revalidatePath("/dashboard/spp");
}

export async function tandaiLunas(id: string) {
  await requireAdmin();
  await prisma.tagihan.update({
    where: { id },
    data: { status: "LUNAS", tanggalBayar: new Date() },
  });
  revalidatePath("/dashboard/spp");
}
export async function konfirmasiTransfer(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await prisma.tagihan.update({
    where: { id },
    data: { status: "MENUNGGU_KONFIRMASI" },
  });
  revalidatePath("/dashboard/spp");
}

export async function verifikasiLunas(id: string) {
  await requireAdmin();
  await prisma.tagihan.update({
    where: { id },
    data: { status: "LUNAS", tanggalBayar: new Date() },
  });
  revalidatePath("/dashboard/spp");
}
export async function tandaiBelumLunas(id: string) {
  await requireAdmin();
  await prisma.tagihan.update({
    where: { id },
    data: { status: "BELUM_LUNAS", tanggalBayar: null },
  });
  revalidatePath("/dashboard/spp");
}