-- AlterTable
ALTER TABLE "Procedure" ADD COLUMN     "vehicleId" TEXT;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
