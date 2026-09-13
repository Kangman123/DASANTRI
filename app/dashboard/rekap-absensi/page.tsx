import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { BarChart3 } from "lucide-react";

export default async function RekapAbsensiPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string; tahun?: string }>;
}) {
  const { bulan, tahun } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isWali = role === "WALI_SANTRI";

  const now = new Date();
  const selectedMonth = bulan ? parseInt(bulan) : now.getMonth() + 1;
  const selectedYear = tahun ? parseInt(tahun) : now.getFullYear();

  const startDate = new Date(selectedYear, selectedMonth - 1, 1);
  const endDate = new Date(selectedYear, selectedMonth, 1);

  const santriWhere = isWali
    ? { waliUserId: session?.user.id }
    : isSuperAdmin
    ? {}
    : { institutionId: session?.user.institutionId ?? "" };

  const santris = await prisma.santri.findMany({
    where: santriWhere,
    include: { absensis: { where: { tanggal: { gte: startDate, lt: endDate } } } },
    orderBy: { name: "asc" },
  });

  const bulanNama = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={20} className="text-teal-600" />
        <p className="text-xl font-medium">Rekap Absensi Bulanan</p>
      </div>

      <form method="GET" className="flex gap-2 mb-6">
        <select name="bulan" defaultValue={selectedMonth}>
          {bulanNama.map((nama, i) => (
            <option key={i} value={i + 1}>{nama}</option>
          ))}
        </select>
        <input type="number" name="tahun" defaultValue={selectedYear} style={{ width: "90px" }} />
        <button type="submit">Tampilkan</button>
      </form>

      <p className="text-sm text-neutral-500 mb-4">
        Periode <span className="font-medium text-neutral-700">{bulanNama[selectedMonth - 1]} {selectedYear}</span>
      </p>

      <div className="bg-neutral-50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="font-medium py-3 px-4">Santri</th>
              <th className="font-medium py-3 px-4 text-center">Hadir</th>
              <th className="font-medium py-3 px-4 text-center">Izin</th>
              <th className="font-medium py-3 px-4 text-center">Sakit</th>
              <th className="font-medium py-3 px-4 text-center">Alpa</th>
              <th className="font-medium py-3 px-4 text-right">Kehadiran</th>
            </tr>
          </thead>
          <tbody>
            {santris.map((s) => {
              const hadir = s.absensis.filter((a) => a.status === "HADIR").length;
              const izin = s.absensis.filter((a) => a.status === "IZIN").length;
              const sakit = s.absensis.filter((a) => a.status === "SAKIT").length;
              const alpa = s.absensis.filter((a) => a.status === "ALPA").length;
              const total = s.absensis.length;
              const persen = total > 0 ? (hadir / total) * 100 : null;

              return (
                <tr key={s.id} className="border-b border-neutral-200 last:border-0">
                  <td className="py-3 px-4 font-medium">{s.name}</td>
                  <td className="py-3 px-4 text-center text-green-700">{hadir}</td>
                  <td className="py-3 px-4 text-center text-amber-700">{izin}</td>
                  <td className="py-3 px-4 text-center text-blue-700">{sakit}</td>
                  <td className="py-3 px-4 text-center text-red-700">{alpa}</td>
                  <td className="py-3 px-4 text-right">
                    {persen !== null ? (
                      <span className={`font-medium ${persen >= 90 ? "text-green-700" : persen >= 75 ? "text-amber-700" : "text-red-700"}`}>
                        {persen.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {santris.length === 0 && (
          <p className="text-sm text-neutral-500 py-8 text-center">
            {isWali ? "Belum ada data santri yang terhubung dengan akun kamu." : "Belum ada data santri."}
          </p>
        )}
      </div>
    </div>
  );
}