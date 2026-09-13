import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType } from "docx";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const santriId = request.nextUrl.searchParams.get("santriId");
  if (!santriId) return new Response("santriId wajib diisi", { status: 400 });

  const santri = await prisma.santri.findUnique({
    where: { id: santriId },
    include: {
      unit: true,
      institution: true,
      nilais: { include: { mataPelajaran: true }, orderBy: { semester: "asc" } },
    },
  });
  if (!santri) return new Response("Santri tidak ditemukan", { status: 404 });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: santri.institution.name, heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: `RAPOR SANTRI — ${santri.unit.name}`, heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: `Nama: ${santri.name}`, bold: true })] }),
          new Paragraph({ text: `NIS: ${santri.nis}` }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Mata Pelajaran" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Semester" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Nilai" })] }),
                ],
              }),
              ...santri.nilais.map(
                (n) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: n.mataPelajaran.name })] }),
                      new TableCell({ children: [new Paragraph({ text: n.semester })] }),
                      new TableCell({ children: [new Paragraph({ text: String(n.nilai) })] }),
                    ],
                  })
              ),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="rapor-${santri.name}.docx"`,
    },
  });
}