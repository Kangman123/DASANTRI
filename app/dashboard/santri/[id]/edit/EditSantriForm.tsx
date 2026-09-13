"use client";
import { useActionState, useState } from "react";
import { updateSantri, type SantriFormState } from "../../actions";

const initialState: SantriFormState = {};
type KelasItem = { id: string; name: string; unitId: string };

type SantriData = {
  nis: string; name: string; waliName: string | null; waliPhone: string | null; fotoUrl: string | null;
  jenisKelamin: string | null; tempatLahir: string | null; dob: Date | null; asalSekolah: string | null;
  address: string | null; namaAyah: string | null; pekerjaanAyah: string | null; namaIbu: string | null;
  pekerjaanIbu: string | null; anakKe: number | null; jumlahSaudara: number | null;
  unitId: string; kelasId: string | null;
};

export function EditSantriForm({
  santriId, santri, units, kelasList,
}: {
  santriId: string; santri: SantriData; units: { id: string; name: string }[]; kelasList: KelasItem[];
}) {
  const updateWithId = updateSantri.bind(null, santriId);
  const [state, formAction, isPending] = useActionState(updateWithId, initialState);
  const [selectedUnitId, setSelectedUnitId] = useState(santri.unitId);

  const filteredKelas = kelasList.filter((k) => k.unitId === selectedUnitId);
  const dobValue = santri.dob ? new Date(santri.dob).toISOString().split("T")[0] : "";

  return (
    <form action={formAction} className="flex flex-col gap-2 max-w-lg">
      {santri.fotoUrl && <img src={santri.fotoUrl} alt="Foto santri" className="w-24 h-24 rounded-lg object-cover mb-2" />}

      <div className="grid grid-cols-2 gap-2">
        <select name="unitId" value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)} required>
          <option value="">-- Pilih Unit --</option>
          {units.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
        </select>
        <select name="kelasId" defaultValue={santri.kelasId ?? ""} required disabled={!selectedUnitId}>
          <option value="">-- Pilih Kelas --</option>
          {filteredKelas.map((k) => (<option key={k.id} value={k.id}>{k.name}</option>))}
        </select>
      </div>

      <p className="text-sm font-medium mt-2">Data Pokok</p>
      <input name="nis" defaultValue={santri.nis} required />
      <input name="name" defaultValue={santri.name} required />
      <select name="jenisKelamin" defaultValue={santri.jenisKelamin ?? ""}>
        <option value="">-- Jenis Kelamin --</option>
        <option value="LAKI_LAKI">Laki-laki</option>
        <option value="PEREMPUAN">Perempuan</option>
      </select>
      <input name="tempatLahir" placeholder="Tempat Lahir" defaultValue={santri.tempatLahir ?? ""} />
      <input name="dob" type="date" defaultValue={dobValue} />
      <input name="asalSekolah" placeholder="Asal Sekolah Sebelumnya" defaultValue={santri.asalSekolah ?? ""} />
      <textarea name="address" placeholder="Alamat Lengkap" defaultValue={santri.address ?? ""} />

      <p className="text-sm font-medium mt-2">Ganti Foto (kosongkan jika tidak ganti)</p>
      <input name="foto" type="file" accept="image/*" />

      <p className="text-sm font-medium mt-2">Data Orang Tua / Wali</p>
      <input name="namaAyah" placeholder="Nama Ayah" defaultValue={santri.namaAyah ?? ""} />
      <input name="pekerjaanAyah" placeholder="Pekerjaan Ayah" defaultValue={santri.pekerjaanAyah ?? ""} />
      <input name="namaIbu" placeholder="Nama Ibu" defaultValue={santri.namaIbu ?? ""} />
      <input name="pekerjaanIbu" placeholder="Pekerjaan Ibu" defaultValue={santri.pekerjaanIbu ?? ""} />
      <input name="anakKe" type="number" placeholder="Anak ke-" defaultValue={santri.anakKe ?? ""} />
      <input name="jumlahSaudara" type="number" placeholder="Jumlah Saudara" defaultValue={santri.jumlahSaudara ?? ""} />
      <input name="waliName" placeholder="Nama Wali" defaultValue={santri.waliName ?? ""} />
      <input name="waliPhone" placeholder="No. HP Wali" defaultValue={santri.waliPhone ?? ""} />
      <input name="waliEmail" placeholder="Email akun Wali (opsional)" />

      <button type="submit" disabled={isPending} className="mt-2 self-start">
        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
      {state.success && <p className="text-green-600 text-sm">Perubahan berhasil disimpan.</p>}
    </form>
  );
}