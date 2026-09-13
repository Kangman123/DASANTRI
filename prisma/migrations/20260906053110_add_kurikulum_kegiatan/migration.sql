-- CreateTable
CREATE TABLE "Kegiatan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hari" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresensiKegiatan" (
    "id" TEXT NOT NULL,
    "kegiatanId" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "status" "StatusKehadiran" NOT NULL,
    "catatan" TEXT,
    "nilai" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresensiKegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PresensiKegiatan_kegiatanId_santriId_tanggal_key" ON "PresensiKegiatan"("kegiatanId", "santriId", "tanggal");

-- AddForeignKey
ALTER TABLE "Kegiatan" ADD CONSTRAINT "Kegiatan_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresensiKegiatan" ADD CONSTRAINT "PresensiKegiatan_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "Kegiatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresensiKegiatan" ADD CONSTRAINT "PresensiKegiatan_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
