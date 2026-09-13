"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN_LEMBAGA" && session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}

async function simpanLogoUnit(file: FormDataEntryValue | null): Promise<string | null> {
  if (!file || !(file instanceof File) || file.size === 0) return null;
  if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_SIZE) return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() || "png";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "unit");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/unit/${filename}`;
}

export async function createUnit(formData: FormData) {
  const session = await requireAdmin();
  const institutionId =
    session.user.role === "SUPER_ADMIN"
      ? (formData.get("institutionId") as string)
      : session.user.institutionId!;

  const tingkatan = formData.get("tingkatan") as string;
  const logoUrl = await simpanLogoUnit(formData.get("logo"));

  await prisma.unit.create({
    data: {
      name: formData.get("name") as string,
      type: formData.get("type") as any,
      tingkatan: tingkatan ? (tingkatan as any) : null,
      hariLiburMingguan: (formData.get("hariLiburMingguan") as string) || null,
      institutionId,
      logoUrl,
    },
  });
  revalidatePath("/dashboard/unit");
}

export async function updateUnit(id: string, formData: FormData) {
  await requireAdmin();
  const tingkatan = formData.get("tingkatan") as string;
  const logoBaru = await simpanLogoUnit(formData.get("logo"));

  await prisma.unit.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      type: formData.get("type") as any,
      tingkatan: tingkatan ? (tingkatan as any) : null,
      hariLiburMingguan: (formData.get("hariLiburMingguan") as string) || null,
      ...(logoBaru ? { logoUrl: logoBaru } : {}),
    },
  });
  revalidatePath("/dashboard/unit");
}

export async function deleteUnit(id: string) {
  await requireAdmin();
  await prisma.unit.delete({ where: { id } });
  revalidatePath("/dashboard/unit");
}