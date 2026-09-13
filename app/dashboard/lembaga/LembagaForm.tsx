"use client";
import { useActionState } from "react";
import { createInstitution, type LembagaFormState } from "./actions";

const initialState: LembagaFormState = {};
const AVAILABLE_MODULES = ["tahfidz", "asrama", "perizinan", "rapor", "kurikulum", "iqro"];

export function LembagaForm() {
  const [state, formAction, isPending] = useActionState(createInstitution, initialState);

  return (
    <form action={formAction} className="bg-white rounded-xl p-4 shadow-sm mb-6 flex flex-col gap-2">
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
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1">Logo Lembaga (JPG/PNG/WebP, maks 2MB)</p>
        <input name="logo" type="file" accept="image/jpeg,image/png,image/webp" />
      </div>
      <button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Menyimpan..." : "Tambah Lembaga"}
      </button>
      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
      {state.success && <p className="text-green-600 text-sm">Lembaga berhasil ditambahkan.</p>}
    </form>
  );
}