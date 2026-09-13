import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { simpanAbsensiGuru } from "./actions";
import { UserCog } from "lucide-react";

export default async function AbsensiGuruPage({
  searchParams,
}: {
  searchParams: Promise<{ tanggal?: string; keterangan?: string }>;
}) {
  const { tanggal, keterangan } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";
  const isAdmin = isSuperAdmin || session?.user.role === "ADMIN_LEMBAGA";
  const where = isSuperAdmin ? { role: "USTADZ" } : { role: "USTADZ", institutionId: session?.user.institutionId ?? "" };

  const gurus = await prisma.user.findMany({ where, orderBy: { name: "asc" } });

  const finalKeterangan = keterangan || "Masuk Kerja";
  const existing: Record<string, { status: string; catatan: string | null }> = {};

  if (tanggal) {
    const records = await prisma.absensiGuru.findMany({
      where: { tanggal: new Date(tanggal), keterangan: finalKeterangan, userId: { in: gurus.map((g) => g.id) } },
    });
    for (const r of records) {
      existing[r.userId] = { status: r.status, catatan: r.catatan };
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
        <UserCog size={20} className="text-violet-600" />
        <p className="text-xl font-medium text-slate-800">Absensi Guru/Ustadz</p>
      </div>

      {!isAdmin && (
        <p className="text-sm text-slate-500 bg-white rounded-xl p-4 shadow-sm mb-4">
          Absensi ini dikelola oleh kepala sekolah/admin lembaga. Kamu bisa melihat datanya di sini.
        </p>
      )}

      <form method="GET" className="flex gap-2 mb-6 bg-white rounded-xl p-4 shadow-sm">
        <input type="date" name="tanggal" defaultValue={tanggal ?? ""} required />
        <input name="keterangan" placeholder="Keterangan (default: Masuk Kerja)" defaultValue={keterangan ?? ""} className="flex-1" />
        <button type="submit">Tampilkan</button>
      </form>

      {tanggal && (
        <form action={isAdmin ? simpanAbsensiGuru : undefined}>
          <input type="hidden" name="tanggal" value={tanggal} />
          <input type="hidden" name="keterangan" value={finalKeterangan} />
          <input type="hidden" name="userIds" value={gurus.map((g) => g.id).join(",")} />

          <p className="text-sm text-slate-500 mb-3">
            <span className="font-medium text-slate-700">{finalKeterangan}</span> — {new Date(tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-400">
                  <th className="font-medium py-3 px-4">Nama</th>
                  <th className="font-medium py-3 px-4">Status</th>
                  <th className="font-medium py-3 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {gurus.map((g) => {
                  const rec = existing[g.id];
                  const currentStatus = rec?.status ?? "HADIR";
                  return (
                    <tr key={g.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2.5 px-4 font-medium text-slate-700">{g.name}</td>
                      <td className="py-2.5 px-4">
                        {isAdmin ? (
                          <select
                            name={`status_${g.id}`}
                            defaultValue={currentStatus}
                            className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${STATUS_STYLE[currentStatus]}`}
                          >
                            <option value="HADIR">Hadir</option>
                            <option value="IZIN">Izin</option>
                            <option value="SAKIT">Sakit</option>
                            <option value="ALPA">Alpa</option>
                          </select>
                        ) : (
                          <span className={`text-xs font-medium rounded-full px-2 py-1 ${STATUS_STYLE[currentStatus]}`}>
                            {currentStatus}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        {isAdmin ? (
                          <input name={`catatan_${g.id}`} defaultValue={rec?.catatan ?? ""} placeholder="opsional" className="w-full text-sm" />
                        ) : (
                          <span className="text-slate-500">{rec?.catatan ?? "-"}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {gurus.length === 0 && <p className="text-sm text-slate-400 py-8 text-center">Belum ada data guru/ustadz.</p>}
          </div>

          {isAdmin && <button type="submit" className="mt-4">Simpan Absensi</button>}
        </form>
      )}
    </div>
  );
}