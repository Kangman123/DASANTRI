import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { simpanPresensiKegiatan } from "./actions";

export default async function PresensiKegiatanPage({
  searchParams,
}: {
  searchParams: Promise<{ kegiatanId?: string; tanggal?: string }>;
}) {
  const { kegiatanId, tanggal } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";
  const where = isSuperAdmin ? {} : { institutionId: session?.user.institutionId ?? "" };

  const kegiatans = await prisma.kegiatan.findMany({ where });

  let santris: { id: string; name: string }[] = [];
  const existing: Record<string, { status: string; catatan: string | null; nilai: string | null }> = {};

  if (kegiatanId && tanggal) {
    santris = await prisma.santri.findMany({ where, orderBy: { name: "asc" } });
    const records = await prisma.presensiKegiatan.findMany({
      where: { kegiatanId, tanggal: new Date(tanggal) },
    });
    for (const r of records) {
      existing[r.santriId] = { status: r.status, catatan: r.catatan, nilai: r.nilai };
    }
  }

  return (
    <div>
      <p className="text-xl font-medium mb-6">Absensi & Penilaian Kegiatan</p>

      <form method="GET" className="flex gap-2 mb-6 bg-neutral-50 rounded-xl p-4">
        <select name="kegiatanId" defaultValue={kegiatanId ?? ""} required>
          <option value="">-- Pilih Kegiatan --</option>
          {kegiatans.map((k) => (
            <option key={k.id} value={k.id}>{k.name} ({k.hari})</option>
          ))}
        </select>
        <input type="date" name="tanggal" defaultValue={tanggal ?? ""} required />
        <button type="submit">Tampilkan</button>
      </form>

      {kegiatanId && tanggal && (
        <form action={simpanPresensiKegiatan}>
          <input type="hidden" name="kegiatanId" value={kegiatanId} />
          <input type="hidden" name="tanggal" value={tanggal} />
          <input type="hidden" name="santriIds" value={santris.map((s) => s.id).join(",")} />

          <div className="bg-neutral-50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="font-medium py-3 px-4">Nama Santri</th>
                  <th className="font-medium py-3 px-4">Status</th>
                  <th className="font-medium py-3 px-4">Catatan/Progress</th>
                  <th className="font-medium py-3 px-4">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {santris.map((s) => {
                  const existingRecord = existing[s.id];
                  return (
                    <tr key={s.id} className="border-b border-neutral-200 last:border-0">
                      <td className="py-2.5 px-4 font-medium">{s.name}</td>
                      <td className="py-2.5 px-4">
                        <select name={`status_${s.id}`} defaultValue={existingRecord?.status ?? "HADIR"} className="text-sm">
                          <option value="HADIR">Hadir</option>
                          <option value="IZIN">Izin</option>
                          <option value="SAKIT">Sakit</option>
                          <option value="ALPA">Alpa</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-4">
                        <input name={`catatan_${s.id}`} defaultValue={existingRecord?.catatan ?? ""} placeholder="misal: Juz 3 hal 5-7" className="w-full text-sm" />
                      </td>
                      <td className="py-2.5 px-4">
                        <input name={`nilai_${s.id}`} defaultValue={existingRecord?.nilai ?? ""} placeholder="Lancar/Kurang Lancar" className="w-full text-sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button type="submit" className="mt-4">Simpan Semua</button>
        </form>
      )}
    </div>
  );
}