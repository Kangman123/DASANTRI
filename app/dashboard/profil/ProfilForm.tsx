"use client";
import { useActionState } from "react";
import { updateProfil, type ProfilFormState } from "./actions";

const initialState: ProfilFormState = {};

export function ProfilForm({ name, email, image }: { name: string; email: string; image: string | null }) {
  const [state, formAction, isPending] = useActionState(updateProfil, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm">
      <div className="flex items-center gap-4">
        {image ? (
          <img src={image} alt={name} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-lg font-medium">
            {name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Ganti Foto Profil</label>
          <input name="foto" type="file" accept="image/*" className="text-sm" />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">Nama</label>
        <input name="name" defaultValue={name} required className="w-full" />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">Email</label>
        <input value={email} disabled className="w-full bg-slate-50" />
        <p className="text-xs text-slate-400 mt-1">Email tidak bisa diubah sendiri.</p>
      </div>

      <button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
      {state.success && <p className="text-green-600 text-sm">Profil berhasil diperbarui.</p>}
    </form>
  );
}