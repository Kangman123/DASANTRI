import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateGuru } from "../../actions";

export default async function EditGuruPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guru = await prisma.user.findUnique({ where: { id } });
  if (!guru) notFound();

  const updateWithId = updateGuru.bind(null, id);

  return (
    <div>
      <p className="text-xl font-medium mb-4">Lengkapi Biodata Guru</p>
      <form action={updateWithId} className="flex flex-col gap-2 max-w-md">
        <input value={guru.name} disabled className="w-full bg-slate-50" />
        <input name="nip" placeholder="NIP/NIY" defaultValue={guru.nip ?? ""} />
        <select name="jenisKelamin" defaultValue={guru.jenisKelamin ?? ""}>
          <option value="">-- Jenis Kelamin --</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
        <input name="tempatLahir" placeholder="Tempat Lahir" defaultValue={guru.tempatLahir ?? ""} />
        <input name="tanggalLahir" placeholder="Tanggal Lahir (contoh: 27 November 1995)" defaultValue={guru.tanggalLahir ?? ""} />
        <textarea name="alamat" placeholder="Alamat" defaultValue={guru.alamat ?? ""} rows={2} />
        <button type="submit" className="self-start mt-2">Simpan Biodata</button>
      </form>
      <a href="/dashboard/guru" className="inline-block mt-4 text-sm text-slate-500">Kembali</a>
    </div>
  );
}