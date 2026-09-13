"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export type ProfilLembagaFormState = { error?: string; success?: boolean };

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

async function simpanLogo(file: FormDataEntryValue | null): Promise<string | null> {
  if (!file || !(file instanceof File) || file.size === 0) return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() || "png";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "lembaga");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/lembaga/${filename}`;
}

export async function updateProfilLembagaSendiri(
  _prevState: ProfilLembagaFormState,
  formData: FormData
): Promise<ProfilLembagaFormState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Sesi berakhir." };
  if (session.user.role !== "ADMIN_LEMBAGA" || !session.user.institutionId) {
    return { error: "Hanya admin lembaga yang bisa mengubah profil ini." };
  }

  const file = formData.get("logo");
  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_TYPES.includes(file.type)) return { error: "Format logo harus JPG, PNG, atau WebP." };
    if (file.size > MAX_SIZE) return { error: "Ukuran logo maksimal 2MB." };
  }

  const logoBaru = await simpanLogo(file);

  await prisma.institution.update({
    where: { id: session.user.institutionId },
    data: {
      namaBank: (formData.get("namaBank") as string) || null,
      noRekening: (formData.get("noRekening") as string) || null,
      atasNamaRekening: (formData.get("atasNamaRekening") as string) || null,
      ...(logoBaru ? { logoUrl: logoBaru } : {}),
      namaArab: (formData.get("namaArab") as string) || null,
      kewajibanKartu: (formData.get("kewajibanKartu") as string) || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profil-lembaga");
  return { success: true };
}