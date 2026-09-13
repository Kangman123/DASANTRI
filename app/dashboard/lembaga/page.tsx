import { prisma } from "@/lib/prisma";
import { createInstitution, deleteInstitution } from "./actions";

const AVAILABLE_MODULES = ["tahfidz", "asrama", "perizinan", "rapor", "kurikulum", "iqro"];

export default async function LembagaPage() {
  const institutions = await prisma.institution.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { santris: true } } },
  });

  return (
    <div>
      <h1>Kelola Lembaga</h1>

      <form action={createInstitution}>
        <input name="name" placeholder="Nama Lembaga" required />
        <select name="type" required>
          <option value="">-- Pilih Jenis --</option>
          <option value="PONDOK">Pondok Pesantren</option>
          <option value="MADRASAH">Madrasah</option>
          <option value="TPQ">TPQ</option>
          <option value="SEKOLAH_UMUM">Sekolah Umum</option>
<option value="TK">TK</option>
<option value="PAUD">PAUD</option>
        </select>
        <div>
          <p>Modul aktif:</p>
          {AVAILABLE_MODULES.map((m) => (
            <label key={m} style={{ marginRight: "10px" }}>
              <input type="checkbox" name="modules" value={m} /> {m}
            </label>
          ))}
        </div>
        <input name="namaBank" placeholder="Nama Bank (misal: BCA)" />
        <input name="noRekening" placeholder="Nomor Rekening" />
        <input name="atasNamaRekening" placeholder="Atas Nama" />
        <button type="submit">Tambah Lembaga</button>
      </form>

      <table>
        <thead>
          <tr><th>Nama</th><th>Jenis</th><th>Jumlah Santri</th><th>Modul</th><th>Aksi</th></tr>
        </thead>
        <tbody>
          {institutions.map((inst) => (
            <tr key={inst.id}>
              <td className="flex items-center gap-2">
  {inst.logoUrl ? (
    <img src={inst.logoUrl} alt={inst.name} className="w-8 h-8 rounded-lg object-cover" />
  ) : (
    <div className="w-8 h-8 rounded-lg bg-neutral-200" />
  )}
  {inst.name}
</td>
              <td>{inst.type}</td>
              <td>{inst._count.santris}</td>
              <td>{inst.modules.join(", ") || "-"}</td>
              <td>
                <a href={`/dashboard/lembaga/${inst.id}/edit`}>Edit</a>
                {" | "}
                <form action={deleteInstitution.bind(null, inst.id)} style={{ display: "inline" }}>
                  <div>
  <p className="text-xs font-medium text-neutral-500 mb-1">Logo Lembaga</p>
  <input name="logo" type="file" accept="image/*" />
</div>
                  <button type="submit">Hapus</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}