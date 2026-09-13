"use client";
import { useActionState } from "react";
import { createAdminLembaga, type AdminLembagaFormState } from "./actions";

const initialState: AdminLembagaFormState = {};

export function AdminLembagaForm({ institutions }: { institutions: { id: string; name: string }[] }) {
  const [state, formAction, isPending] = useActionState(createAdminLembaga, initialState);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
      <p className="text-sm font-medium mb-3">Buat Akun Admin Lembaga Baru</p>
      <form action={formAction} className="flex flex-col gap-2">
        <select name="institutionId" required>
          <option value="">-- Pilih Lembaga --</option>
          {institutions.map((inst) => (
            <option key={inst.id} value={inst.id}>{inst.name}</option>
          ))}
        </select>
        <input name="name" placeholder="Nama Admin" required />
        <input name="email" type="email" placeholder="Email Admin" required />
        <input name="password" type="password" placeholder="Password (minimal 8 karakter)" required minLength={8} />
        <button type="submit" disabled={isPending} className="self-start">
          {isPending ? "Membuat akun..." : "Buat Akun Admin"}
        </button>

        {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
        {state.success && (
          <p className="text-green-600 text-sm">Akun berhasil dibuat. Silakan sampaikan email & password ke admin lembaga.</p>
        )}
      </form>
    </div>
  );
}