"use client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white px-4 py-2.5 rounded-full text-sm w-full justify-center"
    >
      <LogOut size={16} />
      Keluar
    </button>
  );
}