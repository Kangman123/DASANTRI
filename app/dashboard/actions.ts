"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfilLembaga(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN_LEMBAGA" && session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }

  const institutionId =
    session.user.role === "SUPER_ADMIN"
      ? (formData.get("institutionId") as string)
      : session.user.institutionId!;

  await prisma.institution.update({
    where: { id: institutionId },
    data: {
      npsn: (formData.get("npsn") as string) || null,
      namaKepalaSekolah: (formData.get("namaKepalaSekolah") as string) || null,
      nipKepalaSekolah: (formData.get("nipKepalaSekolah") as string) || null,
      provinsi: (formData.get("provinsi") as string) || null,
      kabupaten: (formData.get("kabupaten") as string) || null,
      kecamatan: (formData.get("kecamatan") as string) || null,
      desaKelurahan: (formData.get("desaKelurahan") as string) || null,
      dusun: (formData.get("dusun") as string) || null,
      rt: (formData.get("rt") as string) || null,
      rw: (formData.get("rw") as string) || null,
    },
  });

  revalidatePath("/dashboard");
}