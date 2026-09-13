"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type GuruFormState = { error?: string; success?: boolean };

export async function createGuru(
  _prevState: GuruFormState,
  formData: FormData
): Promise<GuruFormState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Sesi berakhir." };
  if (session.user.role !== "ADMIN_LEMBAGA" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Hanya admin lembaga yang boleh menambah akun guru." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const institutionId =
    session.user.role === "SUPER_ADMIN"
      ? (formData.get("institutionId") as string)
      : session.user.institutionId!;

  if (password.length < 8) return { error: "Password minimal 8 karakter." };

  try {
    const result = await auth.api.signUpEmail({ body: { name, email, password } });
    await prisma.user.update({
      where: { id: result.user.id },
      data: { role: "USTADZ", institutionId },
    });
  } catch {
    return { error: "Gagal membuat akun. Kemungkinan email sudah terdaftar." };
  }

  revalidatePath("/dashboard/guru");
  return { success: true };
}

export async function updateGuru(id: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN_LEMBAGA" && session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }

  await prisma.user.update({
    where: { id },
    data: {
      nip: (formData.get("nip") as string) || null,
      jenisKelamin: (formData.get("jenisKelamin") as string) || null,
      tempatLahir: (formData.get("tempatLahir") as string) || null,
      tanggalLahir: (formData.get("tanggalLahir") as string) || null,
      alamat: (formData.get("alamat") as string) || null,
    },
  });
  revalidatePath("/dashboard/guru");
}

export async function deleteGuru(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN_LEMBAGA" && session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/dashboard/guru");
}