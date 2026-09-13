import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FileSpreadsheet, FileText } from "lucide-react";

export default async function ExportPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "ADMIN_LEMBAGA" && session?.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";
  const where = isSuperAdmin ? {} : { institutionId: session?.user.institutionId ?? "" };

  const units = await prisma.unit.findMany({ where });
  const santris = await prisma.santri.findMany({ where, orderBy: { name: "asc" } });

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <p className="text-xl font-medium">Download Data</p>

      <div className="bg-neutral-50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileSpreadsheet size={18} className="text-green-700" />
          <p className="text-sm font-medium">Rekap Nilai per Unit (Excel)</p>
        </div>
        <p className="text-xs text-neutral-500 mb-3">Semua santri dan nilainya dalam satu unit, bisa diedit di Excel.</p>
        <form action="/api/export/nilai-excel" method="GET" className="flex gap-2">
          <select name="unitId" required className="flex-1">
            <option value="">-- Pilih Unit --</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <button type="submit">Download</button>
        </form>
      </div>

      <div className="bg-neutral-50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={18} className="text-blue-700" />
          <p className="text-sm font-medium">Rapor per Santri (Word)</p>
        </div>
        <p className="text-xs text-neutral-500 mb-3">Dokumen rapor satu santri, siap cetak atau diedit di Word.</p>
        <form action="/api/export/rapor-word" method="GET" className="flex gap-2">
          <select name="santriId" required className="flex-1">
            <option value="">-- Pilih Santri --</option>
            {santris.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
            ))}
          </select>
          <button type="submit">Download</button>
        </form>
      </div>
    </div>
  );
}