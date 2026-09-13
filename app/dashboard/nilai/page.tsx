import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { inputNilai } from "./actions";

export default async function NilaiPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";
  const institutionId = session?.user.institutionId;

  const where = isSuperAdmin ? {} : { institutionId: institutionId ?? "" };

  const santris = await prisma.santri.findMany({ where, orderBy: { name: "asc" } });
  const mapels = await prisma.mataPelajaran.findMany({ where, orderBy: { name: "asc" } });

  return (
    <div>
      <h1>Input Nilai</h1>
<div className="flex items-center justify-between mb-4">
  <h1 className="text-xl font-medium">Input Nilai</h1>
</div>
      <form action={inputNilai}>
        <select name="santriId" required>
          <option value="">-- Pilih Santri --</option>
          {santris.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
          ))}
        </select>

        <select name="mataPelajaranId" required>
          <option value="">-- Pilih Mata Pelajaran --</option>
          {mapels.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <select name="semester" required>
          <option value="">-- Pilih Semester --</option>
          <option value="Ganjil 2026/2027">Ganjil 2026/2027</option>
          <option value="Genap 2026/2027">Genap 2026/2027</option>
        </select>

        <input name="nilai" type="number" step="0.01" min="0" max="100" placeholder="Nilai (0-100)" required />

        <button type="submit">Simpan Nilai</button>
      </form>
    </div>
  );
}