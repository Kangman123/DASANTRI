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

export async function updateProgressTPQ(formData: FormData) {
  await requireStaff();
  const santriId = formData.get("santriId") as string;
  const jilid = formData.get("jilid") as string;
  const halaman = parseInt(formData.get("halaman") as string, 10);
  const catatan = formData.get("catatan") as string;

  await prisma.progressTPQ.upsert({
    where: { santriId },
    update: { jilid: jilid as any, halaman, catatan },
    create: { santriId, jilid: jilid as any, halaman, catatan },
  });

  revalidatePath("/dashboard/progress-tpq");
}