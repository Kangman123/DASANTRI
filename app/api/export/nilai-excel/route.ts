import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ExcelJS from "exceljs";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });
  if (session.user.role !== "ADMIN_LEMBAGA" && session.user.role !== "SUPER_ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  const unitId = request.nextUrl.searchParams.get("unitId");
  if (!unitId) return new Response("unitId wajib diisi", { status: 400 });

  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit) return new Response("Unit tidak ditemukan", { status: 404 });

  const santris = await prisma.santri.findMany({
    where: { unitId },
    include: { nilais: { include: { mataPelajaran: true } } },
    orderBy: { name: "asc" },
  });
  const mapels = await prisma.mataPelajaran.findMany({
    where: { institutionId: unit.institutionId },
    orderBy: { name: "asc" },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Nilai");

  sheet.columns = [
    { header: "NIS", key: "nis", width: 15 },
    { header: "Nama", key: "name", width: 25 },
    ...mapels.map((m) => ({ header: m.name, key: m.id, width: 15 })),
  ];

  for (const s of santris) {
    const row: Record<string, string | number> = { nis: s.nis, name: s.name };
    for (const m of mapels) {
      const nilai = s.nilais.find((n) => n.mataPelajaranId === m.id);
      row[m.id] = nilai ? nilai.nilai : "";
    }
    sheet.addRow(row);
  }
  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="nilai-${unit.name}.xlsx"`,
    },
  });
}