import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function RaporPage({ params }: { params: Promise<{ santriId: string }> }) {
  const { santriId } = await params;

  const santri = await prisma.santri.findUnique({
    where: { id: santriId },
    include: {
      kelasInfo: true,
      nilais: {
        include: { mataPelajaran: true },
        orderBy: { semester: "asc" },
      },
    },
  });

  if (!santri) notFound();

  return (
    <div>
      <h1>Rapor: {santri.name}</h1>
      <p>NIS: {santri.nis} | Kelas: {santri.kelasInfo?.name ?? "-"}</p>

      <table>
        <thead>
          <tr><th>Mata Pelajaran</th><th>Semester</th><th>Nilai</th></tr>
        </thead>
        <tbody>
          {santri.nilais.map((n) => (
            <tr key={n.id}>
              <td>{n.mataPelajaran.name}</td>
              <td>{n.semester}</td>
              <td>{n.nilai}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {santri.nilais.length === 0 && <p>Belum ada nilai yang diinput.</p>}
    </div>
  );
}