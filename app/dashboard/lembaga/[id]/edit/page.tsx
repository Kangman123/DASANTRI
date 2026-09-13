import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditLembagaForm } from "./EditLembagaForm";

export default async function EditLembagaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const institution = await prisma.institution.findUnique({ where: { id } });
  if (!institution) notFound();

  return (
    <div>
      <h1 className="text-xl font-medium mb-4">Edit Lembaga</h1>
      <EditLembagaForm institutionId={institution.id} institution={institution} />
      <a href="/dashboard/lembaga" className="inline-block mt-4 text-sm text-slate-500">Batal, kembali ke daftar</a>
    </div>
  );
}