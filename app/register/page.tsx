"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Moon } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsPending(true);
    const formData = new FormData(e.currentTarget);

    const { error } = await authClient.signUp.email({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    setIsPending(false);
    if (error) {
      setError(error.message || "Gagal mendaftar");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
            <Moon size={22} />
          </div>
          <p className="text-lg font-medium">Database Santri</p>
          <p className="text-sm text-neutral-500">Buat akun baru</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-500 mb-1 block">Nama</label>
              <input name="name" placeholder="Nama lengkap" required className="w-full" />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500 mb-1 block">Email</label>
              <input name="email" type="email" placeholder="nama@email.com" required className="w-full" />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500 mb-1 block">Password</label>
              <input name="password" type="password" placeholder="Minimal 8 karakter" required minLength={8} className="w-full" />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={isPending} className="mt-2 bg-neutral-900 text-white hover:bg-neutral-800">
              {isPending ? "Mendaftar..." : "Daftar"}
            </button>
          </form>
        </div>

        <p className="text-sm text-neutral-500 text-center mt-4">
          Sudah punya akun? <a href="/login" className="text-teal-700 font-medium">Login di sini</a>
        </p>
      </div>
    </div>
  );
}