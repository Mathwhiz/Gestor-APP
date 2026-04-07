-- CreateEnum
CREATE TYPE "VehicleArea" AS ENUM ('GESTORIA', 'AGENCIA');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('EN_TRAMITE', 'EN_STOCK', 'DOCUMENTACION_INCOMPLETA');

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "area" "VehicleArea" NOT NULL,
    "status" "VehicleStatus" NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plate_key" ON "Vehicle"("plate");
