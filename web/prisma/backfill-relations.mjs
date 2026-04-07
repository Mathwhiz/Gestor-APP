import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function normalize(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function main() {
  const [contacts, vehicles, procedures, operations] = await Promise.all([
    prisma.contact.findMany({ select: { id: true, name: true } }),
    prisma.vehicle.findMany({ select: { id: true, plate: true, name: true } }),
    prisma.procedure.findMany({ select: { id: true, clientName: true, vehicleLabel: true } }),
    prisma.operation.findMany({
      select: { id: true, vehicleLabel: true, buyerName: true, sellerName: true },
    }),
  ]);

  for (const procedure of procedures) {
    const contact = contacts.find(
      (item) => normalize(item.name) === normalize(procedure.clientName),
    );
    const vehicle =
      vehicles.find((item) => normalize(procedure.vehicleLabel).includes(normalize(item.plate))) ??
      vehicles.find((item) => normalize(procedure.vehicleLabel).includes(normalize(item.name)));

    await prisma.procedure.update({
      where: { id: procedure.id },
      data: {
        contactId: contact?.id ?? null,
        vehicleId: vehicle?.id ?? null,
      },
    });
  }

  for (const operation of operations) {
    const vehicle =
      vehicles.find((item) => normalize(operation.vehicleLabel).includes(normalize(item.plate))) ??
      vehicles.find((item) => normalize(operation.vehicleLabel).includes(normalize(item.name)));
    const buyer = operation.buyerName
      ? contacts.find((item) => normalize(item.name) === normalize(operation.buyerName))
      : null;
    const seller = operation.sellerName
      ? contacts.find((item) => normalize(item.name) === normalize(operation.sellerName))
      : null;

    await prisma.operation.update({
      where: { id: operation.id },
      data: {
        vehicleId: vehicle?.id ?? null,
        buyerId: buyer?.id ?? null,
        sellerId: seller?.id ?? null,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
