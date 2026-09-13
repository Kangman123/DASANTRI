"use client";
import { useActionState, useState } from "react";
import { createSantri, type SantriFormState } from "./actions";
import { Plus } from "lucide-react";

const initialState: SantriFormState = {};

type KelasItem = { id: string; name: string; unitId: string };

export function SantriForm({
  institutions,
  isSuperAdmin,
  units,
  kelasList,
}: {
  institutions: { id: string; name: string; type: string }[];
  isSuperAdmin: boolean;
  units: { id: string; name: string }[];
  kelasList: KelasItem[];
}) {
  const [state, formAction, isPending] = useActionState(createSantri, initialState);
  const [selectedUnitId, setSelectedUnitId] = useState("");

  const filteredKelas = kelasList.filter((k) => k.unitId === selectedUnitId);

  return (
    <details className="bg-white rounded-xl shadow-sm">
      <summary className="flex items-center gap-2 px-4 py-3 text-sm font-medium cursor-pointer select-none">
        <Plus size={16} /> Tambah Santri Baru
      </summary>

      <form action={formAction} className="p-4 pt-0 flex flex-col gap-4">
        {isSuperAdmin && (
          <select name="institutionId" required className="w-full">
            <option value="">-- Pilih Pondok/Yayasan --</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>{inst.name} ({inst.type})</option>
            ))}
          </select>
        )}

        <div className="grid grid-cols-2 gap-2">
          <select
            name="unitId"
            required
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
          >
            <option value="">-- Pilih Unit (Madrasah/TPQ/dll) --</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          <select name="kelasId" required disabled={!selectedUnitId}>
            <option value="">{selectedUnitId ? "-- Pilih Kelas --" : "Pilih Unit dulu"}</option>
            {filteredKelas.map((k) => (
              <option key={k.id} value={k.id}>{k.name}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Data Pokok</p>
          <div className="grid grid-cols-2 gap-2">
            <input name="nis" placeholder="NIS" required />
            <input name="name" placeholder="Nama Lengkap" required />
            <select name="jenisKelamin">
              <option value="">-- Jenis Kelamin --</option>
              <option value="LAKI_LAKI">Laki-laki</option>
              <option value="PEREMPUAN">Perempuan</option>
            </select>
            <input name="tempatLahir" placeholder="Tempat Lahir" />
            <input name="dob" type="date" />
            <input name="asalSekolah" placeholder="Asal Sekolah Sebelumnya" />
          </div>
          <textarea name="address" placeholder="Alamat Lengkap" className="w-full mt-2" />
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Foto</p>
          <input name="foto" type="file" accept="image/*" className="text-sm" />
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Data Orang Tua / Wali</p>
          <div className="grid grid-cols-2 gap-2">
            <input name="namaAyah" placeholder="Nama Ayah" />
            <input name="pekerjaanAyah" placeholder="Pekerjaan Ayah" />
            <input name="namaIbu" placeholder="Nama Ibu" />
            <input name="pekerjaanIbu" placeholder="Pekerjaan Ibu" />
            <input name="anakKe" type="number" placeholder="Anak ke-" />
            <input name="jumlahSaudara" type="number" placeholder="Jumlah Saudara" />
            <input name="waliName" placeholder="Nama Wali (jika bukan orang tua)" />
            <input name="waliPhone" placeholder="No. HP Wali" />
          </div>
          <input name="waliEmail" placeholder="Email akun Wali (opsional)" className="w-full mt-2" />
        </div>

        <button type="submit" disabled={isPending} className="self-start">
          {isPending ? "Menyimpan..." : "Tambah Santri"}
        </button>
        {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
        {state.success && <p className="text-green-600 text-sm">Santri berhasil ditambahkan.</p>}
      </form>
    </details>
  );
}