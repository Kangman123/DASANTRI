import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { KartuGuruClient } from "./KartuGuruClient";

export default async function KartuGuruPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "ADMIN_LEMBAGA" && session?.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  const where = isSuperAdmin ? { role: "USTADZ" } : { role: "USTADZ", institutionId: session.user.institutionId ?? "" };

  const gurus = await prisma.user.findMany({ where, orderBy: { name: "asc" } });
  const institution = !isSuperAdmin && session.user.institutionId
    ? await prisma.institution.findUnique({ where: { id: session.user.institutionId } })
    : null;

  const cardData = gurus.map((g) => ({
    id: g.id,
    name: g.name,
    email: g.email,
    image: g.image,
    institutionName: institution?.name ?? "-",
    institutionLogo: institution?.logoUrl ?? null,
  }));

  return (
    <div>
      <p className="text-xl font-medium text-slate-800 mb-6 print:hidden">Cetak Kartu Guru/Ustadz</p>
      <KartuGuruClient gurus={cardData} />
    </div>
  );
}