"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export type SantriFormState = { error?: string; success?: boolean };

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN_LEMBAGA" && session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: hanya admin yang boleh mengubah data");
  }
  return session;
}

async function resolveWaliUserId(email: string | null): Promise<string | null> {
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email } });
  return user?.id ?? null;
}

async function simpanFoto(file: FormDataEntryValue | null): Promise<string | null> {
  if (!file || !(file instanceof File) || file.size === 0) return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "santri");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/santri/${filename}`;
}

function ambilBiodata(formData: FormData) {
  const anakKe = formData.get("anakKe") as string;
  const jumlahSaudara = formData.get("jumlahSaudara") as string;
  return {
    jenisKelamin: (formData.get("jenisKelamin") as string) || null,
    tempatLahir: (formData.get("tempatLahir") as string) || null,
    dob: formData.get("dob") ? new Date(formData.get("dob") as string) : null,
    namaAyah: (formData.get("namaAyah") as string) || null,
    namaIbu: (formData.get("namaIbu") as string) || null,
    pekerjaanAyah: (formData.get("pekerjaanAyah") as string) || null,
    pekerjaanIbu: (formData.get("pekerjaanIbu") as string) || null,
    anakKe: anakKe ? parseInt(anakKe) : null,
    jumlahSaudara: jumlahSaudara ? parseInt(jumlahSaudara) : null,
    asalSekolah: (formData.get("asalSekolah") as string) || null,
    address: (formData.get("address") as string) || null,
  };
}

export async function createSantri(
  _prevState: SantriFormState,
  formData: FormData
): Promise<SantriFormState> {
  const session = await requireAdmin();
  const institutionId =
    session.user.role === "SUPER_ADMIN"
      ? (formData.get("institutionId") as string)
      : session.user.institutionId!;

  try {
    const waliUserId = await resolveWaliUserId(formData.get("waliEmail") as string);
    const fotoUrl = await simpanFoto(formData.get("foto"));
    const biodata = ambilBiodata(formData);

    await prisma.santri.create({
      data: {
        nis: formData.get("nis") as string,
        name: formData.get("name") as string,
        waliName: formData.get("waliName") as string,
        waliPhone: formData.get("waliPhone") as string,
        waliUserId,
        institutionId,
        unitId: formData.get("unitId") as string,
        fotoUrl,
        ...biodata,
        jenisKelamin: biodata.jenisKelamin as "LAKI_LAKI" | "PEREMPUAN" | null,
        kelasId: (formData.get("kelasId") as string) || null,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "NIS ini sudah dipakai santri lain. Gunakan NIS yang berbeda." };
    }
    return { error: "Terjadi kesalahan saat menyimpan. Coba lagi." };
  }

  revalidatePath("/dashboard/santri");
  return { success: true };
}

export async function updateSantri(
  id: string,
  _prevState: SantriFormState,
  formData: FormData
): Promise<SantriFormState> {
  await requireAdmin();

  try {
    const waliUserId = await resolveWaliUserId(formData.get("waliEmail") as string);
    const fotoBaru = await simpanFoto(formData.get("foto"));
    const biodata = ambilBiodata(formData);

    await prisma.santri.update({
      where: { id },
      data: {
        nis: formData.get("nis") as string,
        name: formData.get("name") as string,
        waliName: formData.get("waliName") as string,
        waliPhone: formData.get("waliPhone") as string,
        waliUserId,
        unitId: formData.get("unitId") as string,
        ...biodata,
        jenisKelamin: biodata.jenisKelamin as "LAKI_LAKI" | "PEREMPUAN" | null,
        ...(fotoBaru ? { fotoUrl: fotoBaru } : {}),
        kelasId: (formData.get("kelasId") as string) || null,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "NIS ini sudah dipakai santri lain. Gunakan NIS yang berbeda." };
    }
    return { error: "Terjadi kesalahan saat menyimpan. Coba lagi." };
  }

  revalidatePath("/dashboard/santri");
  return { success: true };
}

export async function deleteSantri(id: string) {
  await requireAdmin();
  await prisma.santri.delete({ where: { id } });
  revalidatePath("/dashboard/santri");
}