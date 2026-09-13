import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfilLembagaForm } from "./ProfilLembagaForm";

export default async function ProfilLembagaPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "ADMIN_LEMBAGA" || !session.user.institutionId) {
    redirect("/dashboard");
  }

  const institution = await prisma.institution.findUnique({ where: { id: session.user.institutionId } });
  if (!institution) redirect("/dashboard");

  return (
    <div>
      <p className="text-xl font-medium text-slate-800 mb-6">Profil Lembaga Saya</p>
      <ProfilLembagaForm institution={institution} />
    </div>
  );
}