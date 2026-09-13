import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { deleteSantri } from "./actions";
import { SantriForm } from "./SantriForm";
import { Trash2, FileText, User, Pencil } from "lucide-react";

export default async function SantriPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user.role === "ADMIN_LEMBAGA" || session?.user.role === "SUPER_ADMIN";
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";
  const where = isSuperAdmin ? {} : { institutionId: session?.user.institutionId ?? "" };

  const searchWhere = q
    ? { ...where, OR: [{ name: { contains: q, mode: "insensitive" as const } }, { nis: { contains: q, mode: "insensitive" as const } }] }
    : where;

  const santris = await prisma.santri.findMany({
    where: searchWhere,
    include: { unit: true, kelasInfo: true },
    orderBy: { createdAt: "desc" },
  });

  const institutions = isSuperAdmin ? await prisma.institution.findMany() : [];
  const units = await prisma.unit.findMany({ where });
  const kelasList = await prisma.kelas.findMany({ where: { unit: where } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xl font-medium text-slate-800">Data Santri</p>
          <p className="text-sm text-slate-400">
  {santris.length} santri {q ? `ditemukan untuk "${q}"` : "terdaftar"}
</p>
        </div>
      </div>

      {isAdmin && <SantriForm institutions={institutions} isSuperAdmin={isSuperAdmin} units={units} kelasList={kelasList} />}

      <div className="bg-white rounded-xl overflow-hidden mt-6 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-400">
              <th className="font-medium py-3 px-4">Santri</th>
              <th className="font-medium py-3 px-4">NIS</th>
              <th className="font-medium py-3 px-4">Unit</th>
              <th className="font-medium py-3 px-4">Kelas</th>
              <th className="font-medium py-3 px-4">Wali</th>
              {isAdmin && <th className="font-medium py-3 px-4 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {santris.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {s.fotoUrl ? (
                      <img src={s.fotoUrl} alt={s.name} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-medium">
                        {s.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-slate-700">{s.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-500">{s.nis}</td>
                <td className="py-3 px-4 text-slate-500">{s.unit.name}</td>
                <td className="py-3 px-4 text-slate-500">{s.kelasInfo?.name ?? "-"}</td>
                <td className="py-3 px-4 text-slate-500">{s.waliName ?? "-"}</td>
                {isAdmin && (
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <a href={`/dashboard/santri/${s.id}`} title="Profil" className="hover:text-violet-600"><User size={16} /></a>
                      <a href={`/dashboard/rapor/${s.id}`} title="Rapor" className="hover:text-violet-600"><FileText size={16} /></a>
                      <a href={`/dashboard/santri/${s.id}/edit`} title="Edit" className="hover:text-amber-600"><Pencil size={16} /></a>
                      <form action={deleteSantri.bind(null, s.id)}>
                        <button type="submit" title="Hapus" className="hover:text-red-600"><Trash2 size={16} /></button>
                      </form>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {santris.length === 0 && <p className="text-sm text-slate-400 py-8 text-center">Belum ada data santri.</p>}
      </div>
    </div>
  );
}