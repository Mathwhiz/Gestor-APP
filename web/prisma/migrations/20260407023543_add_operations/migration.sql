-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('COMPRA', 'VENTA', 'CONSIGNACION', 'RESERVA', 'PERMUTA');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('ABIERTA', 'RESERVADA', 'CERRADA', 'ANULADA');

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT,
    "vehicleLabel" TEXT NOT NULL,
    "type" "OperationType" NOT NULL,
    "buyerName" TEXT,
    "sellerName" TEXT,
    "dateLabel" TEXT NOT NULL,
    "agreedPrice" TEXT NOT NULL,
    "realCost" TEXT NOT NULL,
    "commission" TEXT,
    "margin" TEXT NOT NULL,
    "status" "OperationStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
