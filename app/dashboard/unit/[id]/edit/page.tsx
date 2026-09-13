import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateUnit } from "../../actions";

export default async function EditUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const unit = await prisma.unit.findUnique({ where: { id } });
  if (!unit) notFound();

  const updateWithId = updateUnit.bind(null, id);

  return (
    <div>
      <p className="text-xl font-medium mb-4">Edit Unit</p>
      <form action={updateWithId} className="flex flex-col gap-2 max-w-md">
        {unit.logoUrl && <img src={unit.logoUrl} alt={unit.name} className="w-16 h-16 rounded-lg object-cover" />}
        <label className="text-xs font-medium text-slate-500">Ganti Logo Unit (JPG/PNG/WebP, maks 2MB)</label>
        <input name="logo" type="file" accept="image/jpeg,image/png,image/webp" />

        <input name="name" defaultValue={unit.name} required />
        <select name="type" defaultValue={unit.type} required>
          <option value="MADRASAH">Madrasah</option>
          <option value="TPQ">TPQ</option>
          <option value="SEKOLAH_UMUM">Sekolah Umum</option>
          <option value="TK">TK</option>
          <option value="PAUD">PAUD</option>
        </select>
        <select name="tingkatan" defaultValue={unit.tingkatan ?? ""}>
          <option value="">-- Jenjang (khusus Madrasah) --</option>
          <option value="IBTIDAIYYAH">Ibtidaiyyah</option>
          <option value="TSANAWIYAH">Tsanawiyah</option>
          <option value="ALIYAH">Aliyah</option>
        </select>
        <select name="hariLiburMingguan" defaultValue={unit.hariLiburMingguan ?? ""}>
          <option value="">-- Hari Libur Mingguan --</option>
          <option value="Minggu">Minggu</option>
          <option value="Jumat">Jumat</option>
          <option value="Sabtu">Sabtu</option>
        </select>
        <button type="submit" className="self-start mt-2">Simpan Perubahan</button>
      </form>
      <a href="/dashboard/unit" className="inline-block mt-4 text-sm text-slate-500">Batal, kembali ke daftar</a>
    </div>
  );
}