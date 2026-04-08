ALTER TABLE "Procedure" ADD COLUMN     "archivedAt" TIMESTAMP(3);

ALTER TABLE "FinancialMovement" ADD COLUMN     "archivedAt" TIMESTAMP(3);

ALTER TABLE "Operation" ADD COLUMN     "archivedAt" TIMESTAMP(3);
