-- CreateEnum
CREATE TYPE "JilidTPQ" AS ENUM ('PRA', 'JILID_1', 'JILID_2', 'JILID_3', 'JILID_4', 'JILID_5', 'JILID_6', 'AL_QURAN');

-- CreateTable
CREATE TABLE "ProgressTPQ" (
    "id" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "jilid" "JilidTPQ" NOT NULL DEFAULT 'PRA',
    "halaman" INTEGER NOT NULL DEFAULT 0,
    "catatan" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressTPQ_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgressTPQ_santriId_key" ON "ProgressTPQ"("santriId");

-- AddForeignKey
ALTER TABLE "ProgressTPQ" ADD CONSTRAINT "ProgressTPQ_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
