import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditSantriForm } from "./EditSantriForm";

export default async function EditSantriPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const santri = await prisma.santri.findUnique({ where: { id } });
  if (!santri) notFound();

  const units = await prisma.unit.findMany({ where: { institutionId: santri.institutionId } });
  const kelasList = await prisma.kelas.findMany({ where: { unit: { institutionId: santri.institutionId } } });

  return (
    <div>
      <h1 className="text-xl font-medium mb-4">Edit Santri</h1>
      <EditSantriForm santriId={santri.id} santri={santri} units={units} kelasList={kelasList} />
      <a href="/dashboard/santri" className="inline-block mt-4 text-sm text-slate-500">Batal, kembali ke daftar</a>
    </div>
  );
}