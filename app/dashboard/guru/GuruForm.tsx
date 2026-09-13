"use client";
import { useActionState } from "react";
import { createGuru, type GuruFormState } from "./actions";

const initialState: GuruFormState = {};

export function GuruForm({ institutions, isSuperAdmin }: { institutions: { id: string; name: string }[]; isSuperAdmin: boolean }) {
  const [state, formAction, isPending] = useActionState(createGuru, initialState);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
      <p className="text-sm font-medium mb-3 text-slate-700">Tambah Akun Guru/Ustadz</p>
      <form action={formAction} className="flex flex-col gap-2">
        {isSuperAdmin && (
          <select name="institutionId" required>
            <option value="">-- Pilih Lembaga --</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        )}
        <input name="name" placeholder="Nama Guru/Ustadz" required />
        <input name="email" type="email" placeholder="Email" required />
        <button type="submit" disabled={isPending} className="self-start">
          {isPending ? "Membuat akun..." : "Buat Akun"}
        </button>

        {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
        {state.success && state.tempPassword && (
          <div className="bg-amber-50 text-amber-800 text-sm rounded-lg px-3 py-2 mt-2">
            <p className="font-medium">Akun berhasil dibuat.</p>
            <p>Password sementara: <code className="font-mono">{state.tempPassword}</code></p>
            <p className="text-xs mt-1">Catat dan sampaikan ke guru/ustadz secara pribadi — tidak akan ditampilkan lagi setelah halaman di-refresh.</p>
          </div>
        )}
      </form>
    </div>
  );
}