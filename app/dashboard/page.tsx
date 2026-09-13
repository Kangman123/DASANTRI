import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ThumbsUp, Wallet, CalendarCheck } from "lucide-react";
import { AttendanceDonut } from "./AttendanceDonut";
import { MiniCalendar } from "./MiniCalendar";
import { ProgressList } from "./ProgressList";
import { AgendaList } from "./AgendaList";

export default async function DashboardHome() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const where = isSuperAdmin ? {} : { institutionId: session?.user.institutionId ?? "" };

  const totalSantri = await prisma.santri.count({ where });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const absensiBulanIni = await prisma.absensi.findMany({ where: { tanggal: { gte: startOfMonth }, santri: where } });
  const totalHadir = absensiBulanIni.filter((a) => a.status === "HADIR").length;
  const persenHadir = absensiBulanIni.length > 0 ? Math.round((totalHadir / absensiBulanIni.length) * 100) : 0;
  const tanggalAdaAbsensi = [...new Set(absensiBulanIni.map((a) => a.tanggal.getDate()))];

  const tagihanLunas = await prisma.tagihan.count({ where: { santri: where, status: "LUNAS", bulan: now.getMonth() + 1, tahun: now.getFullYear() } });
  const tagihanTotal = await prisma.tagihan.count({ where: { santri: where, bulan: now.getMonth() + 1, tahun: now.getFullYear() } });

  const santris = await prisma.santri.findMany({ where, include: { nilais: true }, take: 20 });
  const topSantri = santris
    .filter((s) => s.nilais.length > 0)
    .map((s) => ({
      name: s.name,
      sub: "Nilai rata-rata",
      percent: Math.round(s.nilais.reduce((sum, n) => sum + n.nilai, 0) / s.nilais.length),
      initials: s.name.slice(0, 2).toUpperCase(),
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3);

  const pengumumans = await prisma.pengumuman.findMany({ where, orderBy: { createdAt: "desc" }, take: 4 });
  const bulanSingkat = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const agendaItems = pengumumans.map((p) => ({
    tanggal: String(new Date(p.createdAt).getDate()),
    bulan: bulanSingkat[new Date(p.createdAt).getMonth()],
    judul: p.judul,
  }));

  const guruTerbaru = await prisma.user.findMany({ where: { ...where, role: "USTADZ" }, take: 3, orderBy: { createdAt: "desc" } });

  return (
    <div className="grid grid-cols-4 gap-5 pt-2">
      <div className="col-span-3 flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0">
              <ThumbsUp size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Santri</p>
              <p className="text-xl font-semibold text-slate-800">{totalSantri}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <Wallet size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400">SPP Lunas Bulan Ini</p>
              <p className="text-xl font-semibold text-slate-800">{tagihanLunas}/{tagihanTotal || 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
              <CalendarCheck size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Kehadiran Bulan Ini</p>
              <p className="text-xl font-semibold text-slate-800">{persenHadir}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center">
            <p className="text-sm font-medium text-slate-700 mb-3 self-start">Progress Kehadiran</p>
            <AttendanceDonut percent={persenHadir} />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-700 mb-4">Santri Nilai Tertinggi</p>
            <ProgressList items={topSantri} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-700 mb-4">Guru/Ustadz Terbaru</p>
          <div className="grid grid-cols-3 gap-4">
            {guruTerbaru.map((g) => (
              <div key={g.id} className="border border-slate-100 rounded-xl p-4 text-center">
                {g.image ? (
                  <img src={g.image} alt={g.name} className="w-14 h-14 rounded-full object-cover mx-auto mb-2" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-medium mx-auto mb-2">
                    {g.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <p className="text-sm font-medium text-slate-700">{g.name}</p>
                <p className="text-xs text-slate-400">Guru/Ustadz</p>
              </div>
            ))}
            {guruTerbaru.length === 0 && <p className="text-sm text-slate-400 col-span-3">Belum ada data guru.</p>}
          </div>
        </div>
      </div>

      <div className="col-span-1 flex flex-col gap-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <MiniCalendar highlightDates={tanggalAdaAbsensi} />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-3">Pengumuman Terbaru</p>
          <AgendaList items={agendaItems} />
        </div>
      </div>
    </div>
  );
}