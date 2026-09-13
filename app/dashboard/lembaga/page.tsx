import { prisma } from "@/lib/prisma";
import { deleteInstitution } from "./actions";
import { LembagaForm } from "./LembagaForm";

export default async function LembagaPage() {
  const institutions = await prisma.institution.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { santris: true } } },
  });

  return (
    <div>
      <p className="text-xl font-medium text-slate-800 mb-6">Kelola Lembaga</p>

      <LembagaForm />

      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-400">
              <th className="font-medium py-3 px-4">Logo</th>
              <th className="font-medium py-3 px-4">Nama</th>
              <th className="font-medium py-3 px-4">Jenis</th>
              <th className="font-medium py-3 px-4">Jumlah Santri</th>
              <th className="font-medium py-3 px-4">Modul</th>
              <th className="font-medium py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {institutions.map((inst) => (
              <tr key={inst.id} className="border-b border-slate-100 last:border-0">
                <td className="py-3 px-4">
                  {inst.logoUrl ? (
                    <img src={inst.logoUrl} alt={inst.name} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-200" />
                  )}
                </td>
                <td className="py-3 px-4 font-medium text-slate-700">{inst.name}</td>
                <td className="py-3 px-4 text-slate-500">{inst.type}</td>
                <td className="py-3 px-4 text-slate-500">{inst._count.santris}</td>
                <td className="py-3 px-4 text-slate-500">{inst.modules.join(", ") || "-"}</td>
                <td className="py-3 px-4 text-right">
                  <a href={`/dashboard/lembaga/${inst.id}/edit`} className="text-violet-600 mr-3">Edit</a>
                  <form action={deleteInstitution.bind(null, inst.id)} style={{ display: "inline" }}>
                    <button type="submit" className="text-red-600">Hapus</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {institutions.length === 0 && <p className="text-sm text-slate-400 py-8 text-center">Belum ada lembaga.</p>}
      </div>
    </div>
  );
}