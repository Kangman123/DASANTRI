-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- AlterTable
ALTER TABLE "Santri" ADD COLUMN     "anakKe" INTEGER,
ADD COLUMN     "asalSekolah" TEXT,
ADD COLUMN     "fotoUrl" TEXT,
ADD COLUMN     "jenisKelamin" "JenisKelamin",
ADD COLUMN     "jumlahSaudara" INTEGER,
ADD COLUMN     "namaAyah" TEXT,
ADD COLUMN     "namaIbu" TEXT,
ADD COLUMN     "pekerjaanAyah" TEXT,
ADD COLUMN     "pekerjaanIbu" TEXT,
ADD COLUMN     "tempatLahir" TEXT;
