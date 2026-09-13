"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export type ProfilFormState = { error?: string; success?: boolean };

async function simpanFotoProfil(file: FormDataEntryValue | null): Promise<string | null> {
  if (!file || !(file instanceof File) || file.size === 0) return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "profil");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/profil/${filename}`;
}

export async function updateProfil(
  _prevState: ProfilFormState,
  formData: FormData
): Promise<ProfilFormState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Sesi berakhir, silakan login ulang." };

  const name = formData.get("name") as string;
  const fotoBaru = await simpanFotoProfil(formData.get("foto"));

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      ...(fotoBaru ? { image: fotoBaru } : {}),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profil");
  return { success: true };
}