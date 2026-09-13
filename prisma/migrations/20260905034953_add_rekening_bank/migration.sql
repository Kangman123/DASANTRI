-- AlterEnum
ALTER TYPE "StatusPembayaran" ADD VALUE 'MENUNGGU_KONFIRMASI';

-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "atasNamaRekening" TEXT,
ADD COLUMN     "namaBank" TEXT,
ADD COLUMN     "noRekening" TEXT;
