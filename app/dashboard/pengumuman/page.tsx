import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createPengumuman, deletePengumuman } from "./actions";
import { Mail } from "lucide-react";

export default async function PengumumanPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user.role === "ADMIN_LEMBAGA" || session?.user.role === "SUPER_ADMIN";
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";
  const where = isSuperAdmin ? {} : { institutionId: session?.user.institutionId ?? "" };

  const pengumumans = await prisma.pengumuman.findMany({ where, orderBy: { createdAt: "desc" } });
  const institutions = isSuperAdmin ? await prisma.institution.findMany() : [];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Mail size={20} className="text-violet-600" />
        <p className="text-xl font-medium text-slate-800">Pengumuman</p>
      </div>

      {isAdmin && (
        <details className="bg-white rounded-xl shadow-sm mb-6">
          <summary className="px-4 py-3 text-sm font-medium cursor-pointer">+ Buat Pengumuman Baru</summary>
          <form action={createPengumuman} className="p-4 pt-0 flex flex-col gap-2">
            {isSuperAdmin && (
              <select name="institutionId" required>
                <option value="">-- Pilih Lembaga --</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            )}
            <input name="judul" placeholder="Judul pengumuman" required />
            <textarea name="isi" placeholder="Isi pengumuman" required rows={3} />
            <button type="submit" className="self-start">Kirim Pengumuman</button>
          </form>
        </details>
      )}

      <div className="flex flex-col gap-3">
        {pengumumans.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-start justify-between">
              <p className="font-medium text-slate-800">{p.judul}</p>
              {isAdmin && (
                <form action={deletePengumuman.bind(null, p.id)}>
                  <button type="submit" className="text-xs text-red-500">Hapus</button>
                </form>
              )}
            </div>
            <p className="text-sm text-slate-600 mt-1">{p.isi}</p>
            <p className="text-xs text-slate-400 mt-2">{new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        ))}
        {pengumumans.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Belum ada pengumuman.</p>}
      </div>
    </div>
  );
}