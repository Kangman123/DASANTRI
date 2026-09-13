import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createKelas, deleteKelas } from "./actions";

export default async function KelasPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";
  const where = isSuperAdmin ? {} : { institutionId: session?.user.institutionId ?? "" };

  const units = await prisma.unit.findMany({ where, orderBy: { name: "asc" } });
  const kelasList = await prisma.kelas.findMany({
    where: { unit: where },
    include: { unit: true, _count: { select: { santris: true } } },
    orderBy: [{ unit: { name: "asc" } }, { createdAt: "asc" }],
  });

  return (
    <div>
      <p className="text-xl font-medium text-slate-800 mb-6">Kelola Kelas</p>

      <form action={createKelas} className="bg-white rounded-xl p-4 shadow-sm mb-6 flex gap-2">
        <select name="unitId" required>
          <option value="">-- Pilih Unit --</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <input name="name" placeholder="Nama Kelas (misal: Kelas 1, Jilid Pra)" required className="flex-1" />
        <button type="submit">Tambah Kelas</button>
      </form>

      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-400">
              <th className="font-medium py-3 px-4">Unit</th>
              <th className="font-medium py-3 px-4">Nama Kelas</th>
              <th className="font-medium py-3 px-4">Jumlah Santri</th>
              <th className="font-medium py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kelasList.map((k) => (
              <tr key={k.id} className="border-b border-slate-100 last:border-0">
                <td className="py-3 px-4 text-slate-500">{k.unit.name}</td>
                <td className="py-3 px-4 font-medium text-slate-700">{k.name}</td>
                <td className="py-3 px-4 text-slate-500">{k._count.santris}</td>
                <td className="py-3 px-4 text-right">
                  <form action={deleteKelas.bind(null, k.id)}>
                    <button type="submit" className="text-red-600 text-xs">Hapus</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {kelasList.length === 0 && <p className="text-sm text-slate-400 py-8 text-center">Belum ada kelas.</p>}
      </div>
    </div>
  );
}