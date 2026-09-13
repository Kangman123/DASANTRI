/*
  Warnings:

  - Added the required column `unitId` to the `Santri` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Santri" ADD COLUMN     "unitId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Santri" ADD CONSTRAINT "Santri_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
