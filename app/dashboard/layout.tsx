import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Search, Bell, Settings, Flag, Moon } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { SidebarNav } from "./SidebarNav";
import { ThemeToggle } from "./ThemeToggle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const role = session.user.role;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const initials = session.user.name?.slice(0, 2).toUpperCase() ?? "??";

  const institution = session.user.institutionId
    ? await prisma.institution.findUnique({ where: { id: session.user.institutionId } })
    : null;

  const tagihanWhere =
    role === "WALI_SANTRI"
      ? { santri: { waliUserId: session.user.id }, status: "BELUM_LUNAS" as const }
      : isSuperAdmin
      ? { status: "BELUM_LUNAS" as const }
      : { santri: { institutionId: session.user.institutionId ?? "" }, status: "BELUM_LUNAS" as const };
  const jumlahBelumLunas = await prisma.tagihan.count({ where: tagihanWhere });

  const menuGroups = [
    {
      label: "Umum",
      items: [
        { href: "/dashboard", icon: "LayoutGrid", label: "Dashboard", show: true },
        { href: "/dashboard/santri", icon: "Users", label: "Data Santri", show: true },
        { href: "/dashboard/pengumuman", icon: "Bell", label: "Pengumuman", show: true },
      ],
    },
    {
      label: "Kepegawaian",
      items: [
        { href: "/dashboard/guru", icon: "UserCog", label: "Kelola Guru/Ustadz", show: role === "ADMIN_LEMBAGA" || isSuperAdmin },
        { href: "/dashboard/absensi-guru", icon: "UserCog", label: "Absensi Guru", show: role !== "WALI_SANTRI" },
      ],
    },
    {
      label: "Akademik & Kesiswaan",
      items: [
        { href: "/dashboard/absensi", icon: "ClipboardCheck", label: "Absensi Santri", show: role !== "WALI_SANTRI" },
        { href: "/dashboard/rekap-absensi", icon: "BarChart3", label: "Rekap Absensi", show: true },
        { href: "/dashboard/mapel", icon: "Book", label: "Mata Pelajaran", show: role !== "WALI_SANTRI" },
        { href: "/dashboard/nilai", icon: "Notebook", label: "Input Nilai", show: role !== "WALI_SANTRI" },
        { href: "/dashboard/kurikulum-kegiatan", icon: "Book", label: "Kurikulum Kegiatan", show: role === "ADMIN_LEMBAGA" || isSuperAdmin },
        { href: "/dashboard/presensi-kegiatan", icon: "ClipboardCheck", label: "Absensi Kegiatan", show: role !== "WALI_SANTRI" },
        { href: "/dashboard/progress-tpq", icon: "BookOpen", label: "Progress TPQ", show: role !== "WALI_SANTRI" },
        { href: "/dashboard/export", icon: "Download", label: "Download Data", show: role === "ADMIN_LEMBAGA" || isSuperAdmin },
        { href: "/dashboard/kartu-santri", icon: "Users", label: "Cetak Kartu Santri", show: role === "ADMIN_LEMBAGA" || isSuperAdmin },
        { href: "/dashboard/kartu-guru", icon: "UserCog", label: "Cetak Kartu Guru", show: role === "ADMIN_LEMBAGA" || isSuperAdmin },
      ],
    },
    {
      label: "Keuangan",
      items: [{ href: "/dashboard/spp", icon: "Wallet", label: "SPP/Syahriyah", show: true }],
    },
    {
      label: "Sistem",
      items: [
        { href: "/dashboard/kelas", icon: "Layers", label: "Kelola Kelas", show: role === "ADMIN_LEMBAGA" || isSuperAdmin },
        { href: "/dashboard/unit", icon: "Layers", label: "Kelola Unit", show: role === "ADMIN_LEMBAGA" || isSuperAdmin },
        { href: "/dashboard/lembaga", icon: "Building2", label: "Kelola Lembaga", show: isSuperAdmin },
        { href: "/dashboard/admin-lembaga", icon: "UserCog", label: "Admin Lembaga", show: isSuperAdmin },
        { href: "/dashboard/profil-lembaga", icon: "Building2", label: "Profil Lembaga Saya", show: role === "ADMIN_LEMBAGA" },
      ],
    },
  ]
    .map((group) => ({ label: group.label, items: group.items.filter((i) => i.show) }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex min-h-screen app-shell-bg">
      <div className="flex w-full max-w-[1400px] mx-auto my-6 rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: "calc(100vh - 3rem)" }}>
        <aside className="w-64 flex-shrink-0 flex flex-col p-6" style={{ background: "#1e2749" }}>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-sky-400 flex items-center justify-center">
              <Moon size={16} className="text-white" />
            </div>
            <p className="text-white text-lg font-semibold tracking-wide">SANTRI</p>
          </div>

          <SidebarNav menuGroups={menuGroups} />

          <div className="pt-4 mt-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3 px-2">
              {session.user.image ? (
                <img src={session.user.image} alt={session.user.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-sky-400 text-white flex items-center justify-center text-xs font-medium">
                  {initials}
                </div>
              )}
              <div>
                <p className="text-white text-sm font-medium">{session.user.name}</p>
                <p className="text-slate-400 text-xs">{role}</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </aside>

        <div className="flex-1 flex flex-col content-panel-bg">
          <header className="px-8 py-5 flex items-center gap-4">
            <p className="text-xl text-slate-800">
              Selamat datang, <span className="font-semibold">{session.user.name?.split(" ")[0]}</span>
            </p>
            <form action="/dashboard/santri" method="GET" className="flex-1 max-w-xs relative ml-4">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="q" placeholder="Cari nama atau NIS santri..." className="w-full pl-9 bg-white border-0 rounded-full text-sm" />
            </form>
            <div className="flex items-center gap-3 ml-auto">
              <a href="/dashboard/pengumuman" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-500">
                <Flag size={15} />
              </a>
              <a href="/dashboard/spp" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-500 relative">
                <Bell size={15} />
                {jumlahBelumLunas > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                    {jumlahBelumLunas}
                  </span>
                )}
              </a>
              <ThemeToggle />
              <a href="/dashboard/profil" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-500">
                <Settings size={15} />
              </a>
              <a href="/dashboard/profil" className="flex items-center gap-2 bg-white rounded-full pl-1 pr-3 py-1">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-sky-400 text-white flex items-center justify-center text-[10px] font-medium">
                    {initials}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-700">{session.user.name?.split(" ")[0]}</span>
              </a>
            </div>
          </header>

          <main className="flex-1 px-8 pb-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}