import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

const JENIS_KELAMIN_LABEL: Record<string, string> = {
  LAKI_LAKI: "Laki-laki",
  PEREMPUAN: "Perempuan",
};

export default async function ProfilSantriPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const santri = await prisma.santri.findUnique({ where: { id }, include: { institution: true, unit: true } });
  if (!santri) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        {santri.fotoUrl ? (
          <img src={santri.fotoUrl} alt={santri.name} className="w-20 h-20 rounded-xl object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 text-xl font-medium">
            {santri.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-xl font-medium">{santri.name}</p>
          <p className="text-sm text-neutral-500">NIS: {santri.nis} — {santri.unit.name} ({santri.institution.name})</p>
        </div>
      </div>

      <div className="bg-neutral-50 rounded-xl p-5 mb-4">
        <p className="text-sm font-medium mb-3">Data Pribadi</p>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <p className="text-neutral-500">Jenis Kelamin</p>
          <p>{santri.jenisKelamin ? JENIS_KELAMIN_LABEL[santri.jenisKelamin] : "-"}</p>
          <p className="text-neutral-500">Tempat, Tanggal Lahir</p>
          <p>{santri.tempatLahir ?? "-"}{santri.dob ? `, ${new Date(santri.dob).toLocaleDateString("id-ID")}` : ""}</p>
          <p className="text-neutral-500">Asal Sekolah</p>
          <p>{santri.asalSekolah ?? "-"}</p>
          <p className="text-neutral-500">Alamat</p>
          <p>{santri.address ?? "-"}</p>
        </div>
      </div>

      <div className="bg-neutral-50 rounded-xl p-5">
        <p className="text-sm font-medium mb-3">Data Orang Tua / Wali</p>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <p className="text-neutral-500">Nama Ayah</p>
          <p>{santri.namaAyah ?? "-"} {santri.pekerjaanAyah ? `(${santri.pekerjaanAyah})` : ""}</p>
          <p className="text-neutral-500">Nama Ibu</p>
          <p>{santri.namaIbu ?? "-"} {santri.pekerjaanIbu ? `(${santri.pekerjaanIbu})` : ""}</p>
          <p className="text-neutral-500">Anak ke- / Jumlah Saudara</p>
          <p>{santri.anakKe ?? "-"} dari {santri.jumlahSaudara ?? "-"} bersaudara</p>
          <p className="text-neutral-500">Wali</p>
          <p>{santri.waliName ?? "-"} — {santri.waliPhone ?? "-"}</p>
        </div>
      </div>

      <a href="/dashboard/santri" className="inline-block mt-4 text-sm text-neutral-500">← Kembali ke daftar</a>
    </div>
  );
}