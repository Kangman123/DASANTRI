import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { GuruForm } from "./GuruForm";
import { deleteGuru } from "./actions";
import { UserCog } from "lucide-react";

export default async function GuruPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "ADMIN_LEMBAGA" && session?.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  const where = isSuperAdmin ? { role: "USTADZ" } : { role: "USTADZ", institutionId: session.user.institutionId ?? "" };

  const gurus = await prisma.user.findMany({ where, orderBy: { createdAt: "desc" } });
  const institutions = isSuperAdmin ? await prisma.institution.findMany() : [];
  const institutionMap = new Map(institutions.map((i) => [i.id, i.name]));

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <UserCog size={20} className="text-violet-600" />
        <p className="text-xl font-medium text-slate-800">Kelola Guru/Ustadz</p>
      </div>

      <GuruForm institutions={institutions} isSuperAdmin={isSuperAdmin} />

      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-400">
              <th className="font-medium py-3 px-4">Nama</th>
              <th className="font-medium py-3 px-4">Email</th>
              {isSuperAdmin && <th className="font-medium py-3 px-4">Lembaga</th>}
              <th className="font-medium py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {gurus.map((g) => (
              <tr key={g.id} className="border-b border-slate-100 last:border-0">
                <td className="py-3 px-4 font-medium text-slate-700">{g.name}</td>
                <td className="py-3 px-4 text-slate-500">{g.email}</td>
                {isSuperAdmin && <td className="py-3 px-4 text-slate-500">{institutionMap.get(g.institutionId ?? "") ?? "-"}</td>}
                <td className="py-3 px-4 text-right">
                  <form action={deleteGuru.bind(null, g.id)}>
                    <button type="submit" className="text-red-600 text-xs">Hapus</button>
                    <a href={`/dashboard/guru/${g.id}/edit`} className="text-violet-600 text-xs mr-3">Biodata</a>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {gurus.length === 0 && <p className="text-sm text-slate-400 py-8 text-center">Belum ada guru/ustadz terdaftar.</p>}
      </div>
    </div>
  );
}