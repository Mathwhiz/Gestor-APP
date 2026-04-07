-- AlterTable
ALTER TABLE "Operation" ADD COLUMN     "buyerId" TEXT,
ADD COLUMN     "sellerId" TEXT;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
