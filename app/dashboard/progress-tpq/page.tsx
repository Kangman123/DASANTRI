import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { updateProgressTPQ } from "./actions";

const JILID_LABEL: Record<string, string> = {
  PRA: "Pra",
  JILID_1: "Jilid 1",
  JILID_2: "Jilid 2",
  JILID_3: "Jilid 3",
  JILID_4: "Jilid 4",
  JILID_5: "Jilid 5",
  JILID_6: "Jilid 6",
  AL_QURAN: "Al-Qur'an",
};

export default async function ProgressTPQPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";
  const institutionWhere = isSuperAdmin ? {} : { institutionId: session?.user.institutionId ?? "" };

  const santris = await prisma.santri.findMany({
    where: { ...institutionWhere, unit: { type: "TPQ" } },
    include: { progressTPQ: true, unit: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <p className="text-xl font-medium mb-6">Progress Baca Al-Qur'an (TPQ)</p>

      <div className="bg-neutral-50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="font-medium py-3 px-4">Santri</th>
              <th className="font-medium py-3 px-4">Unit</th>
              <th className="font-medium py-3 px-4">Progress Saat Ini</th>
              <th className="font-medium py-3 px-4">Update</th>
            </tr>
          </thead>
          <tbody>
            {santris.map((s) => {
              const progress = s.progressTPQ;
              return (
                <tr key={s.id} className="border-b border-neutral-200 last:border-0">
                  <td className="py-3 px-4 font-medium">{s.name}</td>
                  <td className="py-3 px-4 text-neutral-600">{s.unit.name}</td>
                  <td className="py-3 px-4 text-neutral-600">
                    {progress ? `${JILID_LABEL[progress.jilid]} — Hal. ${progress.halaman}` : "Belum ada data"}
                  </td>
                  <td className="py-3 px-4">
                    <form action={updateProgressTPQ} className="flex gap-2">
                      <input type="hidden" name="santriId" value={s.id} />
                      <select name="jilid" defaultValue={progress?.jilid ?? "PRA"} className="text-sm">
                        {Object.entries(JILID_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <input
                        name="halaman"
                        type="number"
                        placeholder="Hal."
                        defaultValue={progress?.halaman ?? 0}
                        required
                        className="w-16 text-sm"
                      />
                      <input
                        name="catatan"
                        placeholder="Catatan"
                        defaultValue={progress?.catatan ?? ""}
                        className="text-sm"
                      />
                      <button type="submit" className="text-sm">Simpan</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {santris.length === 0 && (
          <p className="text-sm text-neutral-500 py-8 text-center">Belum ada santri di unit TPQ.</p>
        )}
      </div>
    </div>
  );
}