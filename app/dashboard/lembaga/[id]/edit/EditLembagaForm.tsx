"use client";
import { useActionState } from "react";
import { updateInstitution, type LembagaFormState } from "../../actions";

const initialState: LembagaFormState = {};
const AVAILABLE_MODULES = ["tahfidz", "asrama", "perizinan", "rapor", "kurikulum", "iqro"];

type InstitutionData = {
  name: string;
  type: string;
  modules: string[];
  namaBank: string | null;
  noRekening: string | null;
  atasNamaRekening: string | null;
  logoUrl: string | null;
};

export function EditLembagaForm({ institutionId, institution }: { institutionId: string; institution: InstitutionData }) {
  const updateWithId = updateInstitution.bind(null, institutionId);
  const [state, formAction, isPending] = useActionState(updateWithId, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2 max-w-lg">
      <input name="name" defaultValue={institution.name} required />
      <select name="type" defaultValue={institution.type} required>
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
            <input type="checkbox" name="modules" value={m} defaultChecked={institution.modules.includes(m)} /> {m}
          </label>
        ))}
      </div>

      <input name="namaBank" placeholder="Nama Bank" defaultValue={institution.namaBank ?? ""} />
      <input name="noRekening" placeholder="Nomor Rekening" defaultValue={institution.noRekening ?? ""} />
      <input name="atasNamaRekening" placeholder="Atas Nama" defaultValue={institution.atasNamaRekening ?? ""} />

      <div>
        {institution.logoUrl && (
          <img src={institution.logoUrl} alt={institution.name} className="w-16 h-16 rounded-lg object-cover mb-2" />
        )}
        <p className="text-xs font-medium text-slate-500 mb-1">Ganti Logo (JPG/PNG/WebP, maks 2MB, kosongkan jika tidak ganti)</p>
        <input name="logo" type="file" accept="image/jpeg,image/png,image/webp" />
      </div>

      <button type="submit" disabled={isPending} className="self-start mt-2">
        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
      {state.success && <p className="text-green-600 text-sm">Perubahan berhasil disimpan.</p>}
    </form>
  );
}