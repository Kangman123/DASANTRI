import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateTagihan, tandaiBelumLunas, konfirmasiTransfer, verifikasiLunas } from "./actions";

const BULAN_NAMA = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  BELUM_LUNAS: { text: "Belum Bayar", color: "text-red-600" },
  MENUNGGU_KONFIRMASI: { text: "Menunggu Konfirmasi", color: "text-amber-600" },
  LUNAS: { text: "Lunas", color: "text-green-600" },
};

export default async function SppPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string; tahun?: string }>;
}) {
  const { bulan, tahun } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdmin = role === "ADMIN_LEMBAGA" || isSuperAdmin;
  const isWali = role === "WALI_SANTRI";

  const now = new Date();
  const selectedBulan = bulan ? parseInt(bulan) : now.getMonth() + 1;
  const selectedTahun = tahun ? parseInt(tahun) : now.getFullYear();

  const santriWhere = isWali
    ? { waliUserId: session?.user.id }
    : isSuperAdmin
    ? {}
    : { institutionId: session?.user.institutionId ?? "" };

  const tagihans = await prisma.tagihan.findMany({
    where: { bulan: selectedBulan, tahun: selectedTahun, santri: santriWhere },
    include: { santri: { include: { institution: true } } },
    orderBy: { santri: { name: "asc" } },
  });

  const institutions = isSuperAdmin ? await prisma.institution.findMany() : [];
  const rekeningInfo = !isSuperAdmin && tagihans[0]?.santri.institution;

  return (
    <div>
      <h1 className="text-xl font-medium mb-4">Pembayaran Syahriyah</h1>

      <form method="GET" className="flex gap-2 mb-4">
        <select name="bulan" defaultValue={selectedBulan}>
          {BULAN_NAMA.map((nama, i) => (
            <option key={i} value={i + 1}>{nama}</option>
          ))}
        </select>
        <input type="number" name="tahun" defaultValue={selectedTahun} style={{ width: "80px" }} />
        <button type="submit">Tampilkan</button>
      </form>

      {isWali && rekeningInfo && rekeningInfo.namaBank && (
        <div className="bg-neutral-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium mb-1">Transfer ke rekening berikut:</p>
          <p className="text-sm">{rekeningInfo.namaBank} — {rekeningInfo.noRekening}</p>
          <p className="text-sm text-neutral-500">a.n. {rekeningInfo.atasNamaRekening}</p>
        </div>
      )}

      {isAdmin && (
        <form action={generateTagihan} className="flex gap-2 mb-6 items-center border-t pt-4">
          <p className="text-sm text-neutral-500 mr-2">Buat tagihan bulan ini untuk semua santri:</p>
          {isSuperAdmin && (
            <select name="institutionId" required>
              <option value="">-- Pilih Lembaga --</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          )}
          <input type="hidden" name="bulan" value={selectedBulan} />
          <input type="hidden" name="tahun" value={selectedTahun} />
          <input name="nominal" type="number" placeholder="Nominal (misal 150000)" required style={{ width: "160px" }} />
          <button type="submit">Buat Tagihan</button>
        </form>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Nama</th>
            <th className="text-left py-2">Nominal</th>
            <th className="text-left py-2">Status</th>
            <th className="text-left py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {tagihans.map((t) => {
            const statusInfo = STATUS_LABEL[t.status];
            return (
              <tr key={t.id} className="border-b">
                <td className="py-2">{t.santri.name}</td>
                <td className="py-2">Rp {t.nominal.toLocaleString("id-ID")}</td>
                <td className="py-2">
                  <span className={statusInfo.color}>{statusInfo.text}</span>
                </td>
                <td className="py-2">
                  {isWali && t.status === "BELUM_LUNAS" && (
                    <form action={konfirmasiTransfer.bind(null, t.id)}>
                      <button type="submit" className="text-amber-600">Saya Sudah Transfer</button>
                    </form>
                  )}
                  {isAdmin && t.status === "MENUNGGU_KONFIRMASI" && (
                    <form action={verifikasiLunas.bind(null, t.id)}>
                      <button type="submit" className="text-green-600">Konfirmasi Lunas</button>
                    </form>
                  )}
                  {isAdmin && t.status === "LUNAS" && (
                    <form action={tandaiBelumLunas.bind(null, t.id)}>
                      <button type="submit" className="text-neutral-500">Batalkan</button>
                    </form>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {tagihans.length === 0 && (
        <p className="text-sm text-neutral-500 mt-4">
          {isAdmin ? "Belum ada tagihan untuk periode ini. Klik \"Buat Tagihan\" di atas." : "Belum ada tagihan untuk periode ini."}
        </p>
      )}
    </div>
  );
}