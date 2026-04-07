-- CreateEnum
CREATE TYPE "ContactRole" AS ENUM ('CLIENTE_PARTICULAR', 'CLIENTE_RECURRENTE', 'TERCERO_DERIVADOR', 'REGISTRO', 'PROVEEDOR');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "ProcedureStatus" AS ENUM ('BORRADOR', 'PENDIENTE_DOCUMENTACION', 'LISTO_PARA_PRESENTAR', 'PRESENTADO', 'OBSERVADO', 'TERMINADO');

-- CreateEnum
CREATE TYPE "ProcedurePriority" AS ENUM ('URGENTE', 'ALTA', 'MEDIA');

-- CreateEnum
CREATE TYPE "MovementArea" AS ENUM ('GESTORIA', 'AGENCIA', 'GENERAL', 'PERSONAL');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('INGRESO', 'EGRESO');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('URGENTE', 'ALTA', 'MEDIA');

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "ContactRole" NOT NULL,
    "document" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "status" "ContactStatus" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "vehicleLabel" TEXT NOT NULL,
    "status" "ProcedureStatus" NOT NULL,
    "priority" "ProcedurePriority" NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "targetDate" TEXT NOT NULL,
    "registryName" TEXT,
    "guideTitle" TEXT,
    "guideSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactId" TEXT,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureRequirement" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "note" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "procedureId" TEXT NOT NULL,

    CONSTRAINT "ProcedureRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureTimeline" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,

    CONSTRAINT "ProcedureTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureMovement" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "area" "MovementArea" NOT NULL,
    "procedureId" TEXT NOT NULL,

    CONSTRAINT "ProcedureMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureNote" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "procedureId" TEXT NOT NULL,

    CONSTRAINT "ProcedureNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialMovement" (
    "id" TEXT NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "area" "MovementArea" NOT NULL,
    "account" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "related" TEXT NOT NULL,
    "dueLabel" TEXT NOT NULL,
    "priority" "TaskPriority" NOT NULL,
    "assignee" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "lastUpdate" TEXT NOT NULL,
    "highlights" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Procedure_slug_key" ON "Procedure"("slug");

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureRequirement" ADD CONSTRAINT "ProcedureRequirement_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureTimeline" ADD CONSTRAINT "ProcedureTimeline_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureMovement" ADD CONSTRAINT "ProcedureMovement_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureNote" ADD CONSTRAINT "ProcedureNote_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
