import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLembagaForm } from "./AdminLembagaForm";

export default async function AdminLembagaPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const institutions = await prisma.institution.findMany({ orderBy: { name: "asc" } });
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN_LEMBAGA" },
    orderBy: { createdAt: "desc" },
  });

  const institutionMap = new Map(institutions.map((i) => [i.id, i.name]));

  return (
    <div>
      <p className="text-xl font-medium mb-6">Kelola Admin Lembaga</p>

      <AdminLembagaForm institutions={institutions} />

      <div className="bg-neutral-50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="font-medium py-3 px-4">Nama</th>
              <th className="font-medium py-3 px-4">Email</th>
              <th className="font-medium py-3 px-4">Lembaga</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-neutral-200 last:border-0">
                <td className="py-3 px-4">{a.name}</td>
                <td className="py-3 px-4 text-neutral-600">{a.email}</td>
                <td className="py-3 px-4 text-neutral-600">{institutionMap.get(a.institutionId ?? "") ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}