import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createKegiatan, deleteKegiatan } from "./actions";

export default async function KurikulumKegiatanPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";
  const where = isSuperAdmin ? {} : { institutionId: session?.user.institutionId ?? "" };

  const kegiatans = await prisma.kegiatan.findMany({ where, orderBy: { createdAt: "desc" } });
  const institutions = isSuperAdmin ? await prisma.institution.findMany() : [];

  return (
    <div>
      <p className="text-xl font-medium mb-1">Kurikulum Kegiatan</p>
      <p className="text-sm text-neutral-500 mb-6">Kegiatan rutin pondok — Tahfidz, Sorogan Kitab, Bimbel, dll</p>

      <details className="bg-neutral-50 rounded-xl mb-6">
        <summary className="px-4 py-3 text-sm font-medium cursor-pointer">+ Tambah Kegiatan</summary>
        <form action={createKegiatan} className="p-4 pt-0 flex gap-2">
          {isSuperAdmin && (
            <select name="institutionId" required>
              <option value="">-- Pilih Pondok --</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          )}
          <input name="name" placeholder="Nama Kegiatan (Tahfidz/Sorogan Kitab/Bimbel)" required className="flex-1" />
          <select name="hari" required>
            <option value="">-- Hari --</option>
            {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu", "Setiap Hari"].map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <button type="submit">Tambah</button>
        </form>
      </details>

      <div className="bg-neutral-50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="font-medium py-3 px-4">Nama Kegiatan</th>
              <th className="font-medium py-3 px-4">Hari</th>
              <th className="font-medium py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kegiatans.map((k) => (
              <tr key={k.id} className="border-b border-neutral-200 last:border-0">
                <td className="py-3 px-4 font-medium">{k.name}</td>
                <td className="py-3 px-4 text-neutral-600">{k.hari}</td>
                <td className="py-3 px-4 text-right">
                  <form action={deleteKegiatan.bind(null, k.id)}>
                    <button type="submit" className="text-red-600">Hapus</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {kegiatans.length === 0 && <p className="text-sm text-neutral-500 py-8 text-center">Belum ada kegiatan.</p>}
      </div>
    </div>
  );
}