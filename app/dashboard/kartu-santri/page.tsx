import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { KartuSantriClient } from "./KartuSantriClient";

export default async function KartuSantriPage({ searchParams }: { searchParams: Promise<{ unitId?: string }> }) {
  const { unitId } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "ADMIN_LEMBAGA" && session?.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  const where = isSuperAdmin ? {} : { institutionId: session.user.institutionId ?? "" };
  const units = await prisma.unit.findMany({ where });

  const santris = unitId
    ? await prisma.santri.findMany({ where: { unitId }, include: { institution: true }, orderBy: { name: "asc" } })
    : [];

  const lembaga = santris[0]?.institution;

  const cardData = santris.map((s) => ({
    id: s.id, name: s.name, nis: s.nis, fotoUrl: s.fotoUrl,
    jenisKelamin: s.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : s.jenisKelamin === "PEREMPUAN" ? "Perempuan" : null,
    tempatLahir: s.tempatLahir, dob: s.dob ? new Date(s.dob).toLocaleDateString("id-ID") : null, address: s.address,
  }));

  return (
    <div>
      <p className="text-xl font-medium text-slate-800 mb-6 print:hidden">Cetak Kartu Tanda Santri (KTS)</p>
      <form method="GET" className="flex gap-2 mb-6 print:hidden">
        <select name="unitId" defaultValue={unitId ?? ""} required>
          <option value="">-- Pilih Unit --</option>
          {units.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
        </select>
        <button type="submit">Tampilkan</button>
      </form>
      {unitId && lembaga && (
        <KartuSantriClient
          santris={cardData}
          lembaga={{
            name: lembaga.name, namaArab: lembaga.namaArab, logoUrl: lembaga.logoUrl,
            kewajibanKartu: lembaga.kewajibanKartu, namaKepalaSekolah: lembaga.namaKepalaSekolah,
            alamatLengkap: "",
          }}
        />
      )}
    </div>
  );
}