"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type AdminLembagaFormState = { error?: string; success?: boolean };

async function requireSuperAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: hanya Super Admin yang boleh menambah admin lembaga");
  }
  return session;
}

export async function createAdminLembaga(
  _prevState: AdminLembagaFormState,
  formData: FormData
): Promise<AdminLembagaFormState> {
  await requireSuperAdmin();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const institutionId = formData.get("institutionId") as string;

  if (password.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }

  try {
    const result = await auth.api.signUpEmail({
      body: { name, email, password },
    });

    await prisma.user.update({
      where: { id: result.user.id },
      data: { role: "ADMIN_LEMBAGA", institutionId },
    });
  } catch {
    return { error: "Gagal membuat akun. Kemungkinan email sudah terdaftar sebelumnya." };
  }

  revalidatePath("/dashboard/admin-lembaga");
  return { success: true };
}