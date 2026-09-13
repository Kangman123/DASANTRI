-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('MADRASAH', 'TPQ', 'SEKOLAH_UMUM', 'TK', 'PAUD');

-- CreateEnum
CREATE TYPE "Tingkatan" AS ENUM ('IBTIDAIYYAH', 'TSANAWIYAH', 'ALIYAH');

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "UnitType" NOT NULL,
    "tingkatan" "Tingkatan",
    "institutionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
