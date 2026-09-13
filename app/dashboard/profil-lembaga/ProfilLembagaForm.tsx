"use client";
import { useActionState } from "react";
import { updateProfilLembagaSendiri, type ProfilLembagaFormState } from "./actions";

const initialState: ProfilLembagaFormState = {};

type InstitutionData = {
  name: string;
  logoUrl: string | null;
  namaBank: string | null;
  noRekening: string | null;
  atasNamaRekening: string | null;
  namaArab: string | null;
  kewajibanKartu: string | null;
};

export function ProfilLembagaForm({ institution }: { institution: InstitutionData }) {
  const [state, formAction, isPending] = useActionState(updateProfilLembagaSendiri, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 max-w-sm">
      <div className="flex items-center gap-4">
        {institution.logoUrl ? (
          <img src={institution.logoUrl} alt={institution.name} className="w-16 h-16 rounded-xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center text-lg font-medium">
            {institution.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Ganti Logo (JPG/PNG/WebP, maks 2MB)</label>
          <input name="logo" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
        </div>
      </div>

      <input value={institution.name} disabled className="w-full bg-slate-50" />

      <input
        name="namaArab"
        placeholder="Nama Lembaga (Arab)"
        defaultValue={institution.namaArab ?? ""}
        dir="rtl"
      />

      <textarea
        name="kewajibanKartu"
        placeholder="Kewajiban santri, satu baris satu poin"
        defaultValue={institution.kewajibanKartu ?? ""}
        rows={4}
      />

      <p className="text-xs font-medium text-slate-500 mt-2">Info Rekening (untuk tampilan SPP)</p>
      <input name="namaBank" placeholder="Nama Bank" defaultValue={institution.namaBank ?? ""} />
      <input name="noRekening" placeholder="Nomor Rekening" defaultValue={institution.noRekening ?? ""} />
      <input name="atasNamaRekening" placeholder="Atas Nama" defaultValue={institution.atasNamaRekening ?? ""} />

      <button type="submit" disabled={isPending} className="self-start mt-2">
        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
      {state.success && <p className="text-green-600 text-sm">Profil lembaga berhasil diperbarui.</p>}
    </form>
  );
}