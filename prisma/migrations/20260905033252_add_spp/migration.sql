-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('BELUM_LUNAS', 'LUNAS');

-- AlterEnum
ALTER TYPE "InstitutionType" ADD VALUE 'SEKOLAH_UMUM';

-- CreateTable
CREATE TABLE "Tagihan" (
    "id" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "nominal" DOUBLE PRECISION NOT NULL,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'BELUM_LUNAS',
    "tanggalBayar" TIMESTAMP(3),
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tagihan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tagihan_santriId_bulan_tahun_key" ON "Tagihan"("santriId", "bulan", "tahun");

-- AddForeignKey
ALTER TABLE "Tagihan" ADD CONSTRAINT "Tagihan_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
