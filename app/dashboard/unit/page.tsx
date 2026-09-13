import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createUnit, deleteUnit } from "./actions";

const TINGKATAN_LABEL: Record<string, string> = {
  IBTIDAIYYAH: "Ibtidaiyyah",
  TSANAWIYAH: "Tsanawiyah",
  ALIYAH: "Aliyah",
};

export default async function UnitPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";
  const where = isSuperAdmin ? {} : { institutionId: session?.user.institutionId ?? "" };

  const units = await prisma.unit.findMany({
    where,
    include: { institution: true },
    orderBy: { createdAt: "desc" },
  });

  const institutions = isSuperAdmin ? await prisma.institution.findMany() : [];

  return (
    <div>
      <p className="text-xl font-medium mb-6">Kelola Unit (Madrasah/TPQ/dll)</p>

      <form action={createUnit} className="bg-neutral-50 rounded-xl p-4 mb-6 flex flex-col gap-2">
        {isSuperAdmin && (
          <select name="institutionId" required>
            <option value="">-- Pilih Pondok/Yayasan --</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        )}
        <input name="name" placeholder="Nama Unit (misal: Madrasah Tsanawiyah Al-Hikmah)" required />
        <select name="type" required>
          <option value="">-- Jenis Unit --</option>
          <option value="MADRASAH">Madrasah</option>
          <option value="TPQ">TPQ</option>
          <option value="SEKOLAH_UMUM">Sekolah Umum</option>
          <option value="TK">TK</option>
          <option value="PAUD">PAUD</option>
        </select>
        <select name="tingkatan">
          <option value="">-- Jenjang (khusus Madrasah) --</option>
          <option value="IBTIDAIYYAH">Ibtidaiyyah</option>
          <option value="TSANAWIYAH">Tsanawiyah</option>
          <option value="ALIYAH">Aliyah</option>
        </select>
        <input name="logo" type="file" accept="image/jpeg,image/png,image/webp" />
        <select name="hariLiburMingguan">
          <option value="">-- Hari Libur Mingguan --</option>
          <option value="Minggu">Minggu</option>
          <option value="Jumat">Jumat</option>
          <option value="Sabtu">Sabtu</option>
        </select>
        <button type="submit" className="self-start">Tambah Unit</button>
      </form>

      <div className="bg-neutral-50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="font-medium py-3 px-4">Logo</th>
              <th className="font-medium py-3 px-4">Nama Unit</th>
              <th className="font-medium py-3 px-4">Jenis</th>
              <th className="font-medium py-3 px-4">Jenjang</th>
              <th className="font-medium py-3 px-4">Libur</th>
              {isSuperAdmin && <th className="font-medium py-3 px-4">Pondok/Yayasan</th>}
              <th className="font-medium py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr key={u.id} className="border-b border-neutral-200 last:border-0">
                <td className="py-3 px-4">
  {u.logoUrl ? (
    <img src={u.logoUrl} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
  ) : (
    <div className="w-8 h-8 rounded-lg bg-slate-200" />
  )}
</td>
<td className="py-3 px-4">{u.name}</td>
                <td className="py-3 px-4">{u.type}</td>
                <td className="py-3 px-4">{u.tingkatan ? TINGKATAN_LABEL[u.tingkatan] : "-"}</td>
                <td className="py-3 px-4">{u.hariLiburMingguan ?? "-"}</td>
                {isSuperAdmin && <td className="py-3 px-4">{u.institution.name}</td>}
                <td className="py-3 px-4 text-right">
  <a href={`/dashboard/unit/${u.id}/edit`} className="text-violet-600 mr-3">Edit</a>
  <form action={deleteUnit.bind(null, u.id)} style={{ display: "inline" }}>
                    <button type="submit" className="text-red-600">Hapus</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {units.length === 0 && <p className="text-sm text-neutral-500 py-8 text-center">Belum ada unit.</p>}
      </div>
    </div>
  );
}