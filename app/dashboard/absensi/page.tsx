import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { simpanAbsensi } from "./actions";
import { ClipboardCheck } from "lucide-react";

export default async function AbsensiPage({
  searchParams,
}: {
  searchParams: Promise<{ tanggal?: string; keterangan?: string }>;
}) {
  const { tanggal, keterangan } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";
  const where = isSuperAdmin ? {} : { institutionId: session?.user.institutionId ?? "" };

  let santris: { id: string; name: string; nis: string; fotoUrl: string | null }[] = [];
  const existing: Record<string, { status: string; catatan: string | null }> = {};

  if (tanggal && keterangan) {
    santris = await prisma.santri.findMany({ where, orderBy: { name: "asc" } });
    const records = await prisma.absensi.findMany({
      where: { tanggal: new Date(tanggal), keterangan },
    });
    for (const r of records) {
      existing[r.santriId] = { status: r.status, catatan: r.catatan };
    }
  }

  const STATUS_STYLE: Record<string, string> = {
    HADIR: "text-green-700 bg-green-50",
    IZIN: "text-amber-700 bg-amber-50",
    SAKIT: "text-blue-700 bg-blue-50",
    ALPA: "text-red-700 bg-red-50",
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ClipboardCheck size={20} className="text-teal-600" />
        <p className="text-xl font-medium">Absensi Santri</p>
      </div>

      <form method="GET" className="flex gap-2 mb-6 bg-neutral-50 rounded-xl p-4">
        <input type="date" name="tanggal" defaultValue={tanggal ?? ""} required />
        <input
          name="keterangan"
          placeholder="Nama kegiatan (misal: Masuk Kelas, Ngaji Sore)"
          defaultValue={keterangan ?? ""}
          required
          className="flex-1"
        />
        <button type="submit">Tampilkan</button>
      </form>

      {tanggal && keterangan && (
        <form action={simpanAbsensi}>
          <input type="hidden" name="tanggal" value={tanggal} />
          <input type="hidden" name="keterangan" value={keterangan} />
          <input type="hidden" name="santriIds" value={santris.map((s) => s.id).join(",")} />

          <p className="text-sm text-neutral-500 mb-3">
            Absensi <span className="font-medium text-neutral-700">{keterangan}</span> — {new Date(tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div className="bg-neutral-50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="font-medium py-3 px-4">Santri</th>
                  <th className="font-medium py-3 px-4">Status</th>
                  <th className="font-medium py-3 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {santris.map((s) => {
                  const rec = existing[s.id];
                  const currentStatus = rec?.status ?? "HADIR";
                  return (
                    <tr key={s.id} className="border-b border-neutral-200 last:border-0">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          {s.fotoUrl ? (
                            <img src={s.fotoUrl} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-medium">
                              {s.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{s.name}</p>
                            <p className="text-xs text-neutral-400">{s.nis}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <select
                          name={`status_${s.id}`}
                          defaultValue={currentStatus}
                          className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${STATUS_STYLE[currentStatus]}`}
                        >
                          <option value="HADIR">Hadir</option>
                          <option value="IZIN">Izin</option>
                          <option value="SAKIT">Sakit</option>
                          <option value="ALPA">Alpa</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-4">
                        <input name={`catatan_${s.id}`} defaultValue={rec?.catatan ?? ""} placeholder="opsional" className="w-full text-sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button type="submit" className="mt-4">Simpan Absensi</button>
        </form>
      )}
    </div>
  );
}