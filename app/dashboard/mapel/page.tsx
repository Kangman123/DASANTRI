import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createMapel, deleteMapel } from "./actions";

export default async function MapelPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";

  const mapels = await prisma.mataPelajaran.findMany({
    where: isSuperAdmin ? {} : { institutionId: session?.user.institutionId ?? "" },
    include: { institution: true },
    orderBy: { createdAt: "desc" },
  });

  const institutions = isSuperAdmin ? await prisma.institution.findMany() : [];

  return (
    <div>
      <h1>Mata Pelajaran</h1>

      <form action={createMapel}>
        {isSuperAdmin && (
          <select name="institutionId" required>
            <option value="">-- Pilih Lembaga --</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        )}
        <input name="name" placeholder="Nama Mata Pelajaran" required />
        <button type="submit">Tambah</button>
      </form>

      <table>
        <thead><tr><th>Mata Pelajaran</th>{isSuperAdmin && <th>Lembaga</th>}<th>Aksi</th></tr></thead>
        <tbody>
          {mapels.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              {isSuperAdmin && <td>{m.institution.name}</td>}
              <td>
                <form action={deleteMapel.bind(null, m.id)}>
                  <button type="submit">Hapus</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}