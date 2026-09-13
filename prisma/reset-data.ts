import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Menghapus data kegiatan...");
  await prisma.presensiKegiatan.deleteMany({});
  await prisma.kegiatan.deleteMany({});

  console.log("Menghapus data SPP, absensi, progress TPQ, nilai...");
  await prisma.tagihan.deleteMany({});
  await prisma.absensi.deleteMany({});
  await prisma.progressTPQ.deleteMany({});
  await prisma.nilai.deleteMany({});

  console.log("Menghapus data santri...");
  await prisma.santri.deleteMany({});

  console.log("Menghapus mata pelajaran, unit, dan lembaga...");
  await prisma.mataPelajaran.deleteMany({});
  await prisma.unit.deleteMany({});
  await prisma.institution.deleteMany({});

  console.log("Menghapus akun selain SUPER_ADMIN...");
  const nonSuperAdmins = await prisma.user.findMany({
    where: { role: { not: "SUPER_ADMIN" } },
  });
  const ids = nonSuperAdmins.map((u) => u.id);

  await prisma.session.deleteMany({ where: { userId: { in: ids } } });
  await prisma.account.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { role: { not: "SUPER_ADMIN" } } });

  console.log("Selesai! Semua data bersih, akun Super Admin tetap ada.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());