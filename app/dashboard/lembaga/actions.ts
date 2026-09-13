"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export type LembagaFormState = { error?: string; success?: boolean };

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

async function requireSuperAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: hanya Super Admin yang boleh mengelola lembaga");
  }
  return session;
}

function validasiLogo(file: FormDataEntryValue | null): string | null {
  if (!file || !(file instanceof File) || file.size === 0) return null; // tidak wajib
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Format logo harus JPG, PNG, atau WebP.";
  }
  if (file.size > MAX_SIZE) {
    return "Ukuran logo maksimal 2MB.";
  }
  return null;
}

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

export async function createInstitution(
  _prevState: LembagaFormState,
  formData: FormData
): Promise<LembagaFormState> {
  await requireSuperAdmin();
  const modules = formData.getAll("modules") as string[];

  const errorLogo = validasiLogo(formData.get("logo"));
  if (errorLogo) return { error: errorLogo };

  const logoUrl = await simpanLogo(formData.get("logo"));

  await prisma.institution.create({
    data: {
      name: formData.get("name") as string,
      type: formData.get("type") as any,
      modules,
      namaBank: formData.get("namaBank") as string,
      noRekening: formData.get("noRekening") as string,
      atasNamaRekening: formData.get("atasNamaRekening") as string,
      logoUrl,
    },
  });
  revalidatePath("/dashboard/lembaga");
  return { success: true };
}

export async function updateInstitution(
  id: string,
  _prevState: LembagaFormState,
  formData: FormData
): Promise<LembagaFormState> {
  await requireSuperAdmin();
  const modules = formData.getAll("modules") as string[];

  const errorLogo = validasiLogo(formData.get("logo"));
  if (errorLogo) return { error: errorLogo };

  const logoBaru = await simpanLogo(formData.get("logo"));

  await prisma.institution.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      type: formData.get("type") as any,
      modules,
      namaBank: formData.get("namaBank") as string,
      noRekening: formData.get("noRekening") as string,
      atasNamaRekening: formData.get("atasNamaRekening") as string,
      ...(logoBaru ? { logoUrl: logoBaru } : {}),
    },
  });
  revalidatePath("/dashboard/lembaga");
  return { success: true };
}

export async function deleteInstitution(id: string) {
  await requireSuperAdmin();
  await prisma.institution.delete({ where: { id } });
  revalidatePath("/dashboard/lembaga");
}