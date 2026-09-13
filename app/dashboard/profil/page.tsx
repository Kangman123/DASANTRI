import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfilForm } from "./ProfilForm";

export default async function ProfilPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <div>
      <p className="text-xl font-medium text-slate-800 mb-6">Profil Saya</p>
      <ProfilForm name={session.user.name} email={session.user.email} image={session.user.image ?? null} />
    </div>
  );
}