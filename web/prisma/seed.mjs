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

async function main() {
  await prisma.procedureNote.deleteMany();
  await prisma.procedureMovement.deleteMany();
  await prisma.procedureTimeline.deleteMany();
  await prisma.procedureRequirement.deleteMany();
  await prisma.procedure.deleteMany();
  await prisma.task.deleteMany();
  await prisma.financialMovement.deleteMany();
  await prisma.guide.deleteMany();
  await prisma.operation.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.contact.deleteMany();

  const contacts = await prisma.contact.createManyAndReturn({
    data: [
      {
        name: "Carlos Fernandez",
        role: "CLIENTE_PARTICULAR",
        document: "DNI 24.556.120",
        phone: "+54 2954 441122",
        location: "Santa Rosa, La Pampa",
        status: "ACTIVO",
      },
      {
        name: "Mariana Lopez",
        role: "CLIENTE_RECURRENTE",
        document: "DNI 28.445.871",
        phone: "+54 2954 223344",
        location: "Toay, La Pampa",
        status: "ACTIVO",
      },
      {
        name: "Agencia Ruta 5",
        role: "TERCERO_DERIVADOR",
        document: "CUIT 30-71234567-8",
        phone: "+54 11 4444 8899",
        location: "CABA",
        status: "ACTIVO",
      },
      {
        name: "Registro Seccional Santa Rosa 2",
        role: "REGISTRO",
        document: "Organismo",
        phone: "+54 2954 402200",
        location: "Santa Rosa, La Pampa",
        status: "ACTIVO",
      },
      {
        name: "Estudio Contable Suarez",
        role: "PROVEEDOR",
        document: "CUIT 30-70999888-1",
        phone: "+54 2954 554433",
        location: "General Pico, La Pampa",
        status: "ACTIVO",
      },
    ],
  });

  const contactByName = Object.fromEntries(contacts.map((contact) => [contact.name, contact]));

  const vehicles = await prisma.vehicle.createManyAndReturn({
    data: [
      {
        plate: "AE918KD",
        name: "Ford Ranger XLS 2019",
        owner: "Carlos Fernandez",
        area: "GESTORIA",
        status: "EN_TRAMITE",
        note: "Transferencia con documentacion faltante.",
      },
      {
        plate: "AG552LM",
        name: "Toyota Corolla XEI 2021",
        owner: "Agencia",
        area: "AGENCIA",
        status: "EN_STOCK",
        note: "Unidad lista para publicar y mostrar.",
      },
      {
        plate: "AC345TR",
        name: "Volkswagen Gol Trend 2016",
        owner: "Mariana Lopez",
        area: "GESTORIA",
        status: "DOCUMENTACION_INCOMPLETA",
        note: "Falta autorizacion complementaria.",
      },
    ],
  });

  const vehicleByPlate = Object.fromEntries(vehicles.map((vehicle) => [vehicle.plate, vehicle]));

  await prisma.operation.createMany({
    data: [
      {
        vehicleId: vehicleByPlate["AG552LM"].id,
        buyerId: null,
        sellerId: null,
        vehicleLabel: "Toyota Corolla XEI 2021 - AG552LM",
        type: "VENTA",
        buyerName: "Martin Sosa",
        sellerName: "Agencia",
        dateLabel: "06/04/2026",
        agreedPrice: "$ 18.900.000",
        realCost: "$ 17.250.000",
        commission: "$ 0",
        margin: "$ 1.650.000",
        status: "ABIERTA",
        notes: "Unidad publicada, con dos visitas agendadas.",
      },
      {
        buyerId: null,
        sellerId: contactByName["Agencia Ruta 5"].id,
        vehicleLabel: "Peugeot 208 2020 - AG552LM",
        type: "CONSIGNACION",
        buyerName: null,
        sellerName: "Agencia Ruta 5",
        dateLabel: "05/04/2026",
        agreedPrice: "$ 14.200.000",
        realCost: "$ 13.500.000",
        commission: "$ 700.000",
        margin: "$ 700.000",
        status: "RESERVADA",
        notes: "Operacion con reserva tomada, pendiente de cierre.",
      },
      {
        vehicleId: vehicleByPlate["AE918KD"].id,
        buyerId: null,
        sellerId: contactByName["Carlos Fernandez"].id,
        vehicleLabel: "Ford Ranger XLS 2019 - AE918KD",
        type: "COMPRA",
        buyerName: "Agencia",
        sellerName: "Carlos Fernandez",
        dateLabel: "03/04/2026",
        agreedPrice: "$ 23.500.000",
        realCost: "$ 22.800.000",
        commission: "$ 0",
        margin: "$ 700.000",
        status: "CERRADA",
        notes: "Ingreso a stock con transferencia ya encaminada.",
      },
    ],
  });

  await prisma.guide.createMany({
    data: [
      {
        title: "Transferencia",
        summary:
          "Checklist base, pasos de control y links utiles para no dejar firmas o verificaciones afuera.",
        scope: "Base",
        jurisdiction: "Nacional + notas La Pampa",
        lastUpdate: "Actualizada 04/04",
        highlights: [
          "Verificar titularidad, deuda y documentacion antes de mover carpeta.",
          "Confirmar si hay requisito adicional del registro o jurisdiccion.",
        ],
      },
      {
        title: "Duplicado de cedula",
        summary:
          "Guia corta para documentacion requerida, observaciones comunes y validaciones previas.",
        scope: "Base",
        jurisdiction: "Nacional",
        lastUpdate: "Actualizada 01/04",
        highlights: [
          "Controlar legitimacion del solicitante y constancia de titularidad.",
          "Registrar siempre si la gestion depende de presencia o autorizacion.",
        ],
      },
      {
        title: "Denuncia de venta",
        summary:
          "Resumen de pasos, papeles y criterio interno para evitar rechazos o entregas incompletas.",
        scope: "Interna",
        jurisdiction: "Nacional + provincial",
        lastUpdate: "Actualizada 03/04",
        highlights: [
          "Validar fecha exacta de la venta y documentacion respaldatoria.",
          "Dejar trazabilidad del resultado y constancia entregada al cliente.",
        ],
      },
    ],
  });

  await prisma.financialMovement.createMany({
    data: [
      {
        dateLabel: "06/04/2026",
        description: "Cobro honorarios transferencia Ranger",
        category: "Honorarios de tramites",
        area: "GESTORIA",
        account: "Caja gestoria",
        amount: "+ $ 320.000",
        type: "INGRESO",
      },
      {
        dateLabel: "06/04/2026",
        description: "Pago formularios y sellados",
        category: "Aranceles",
        area: "GESTORIA",
        account: "Caja gestoria",
        amount: "- $ 42.000",
        type: "EGRESO",
      },
      {
        dateLabel: "06/04/2026",
        description: "Combustible por recorrida a registro",
        category: "Viaticos",
        area: "GENERAL",
        account: "Caja general",
        amount: "- $ 18.000",
        type: "EGRESO",
      },
      {
        dateLabel: "06/04/2026",
        description: "Comision pagada a tercero",
        category: "Comisiones pagadas",
        area: "GESTORIA",
        account: "Caja gestoria",
        amount: "- $ 24.000",
        type: "EGRESO",
      },
      {
        dateLabel: "05/04/2026",
        description: "Pago de alquiler oficina",
        category: "Alquiler",
        area: "GENERAL",
        account: "Banco",
        amount: "- $ 110.000",
        type: "EGRESO",
      },
    ],
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Pedir firma faltante por transferencia",
        related: "Transferencia - Carlos Fernandez",
        dueLabel: "Hoy - 10:30",
        priority: "URGENTE",
        assignee: "Marcelo",
        done: false,
      },
      {
        title: "Llevar carpeta al Registro Santa Rosa 2",
        related: "Duplicado de cedula - Volkswagen Gol",
        dueLabel: "Hoy - 13:00",
        priority: "ALTA",
        assignee: "Marcelo",
        done: false,
      },
      {
        title: "Revisar observacion de patentamiento",
        related: "Toyota Yaris 0km",
        dueLabel: "Manana - 09:15",
        priority: "URGENTE",
        assignee: "Marcelo",
        done: false,
      },
      {
        title: "Cobrar honorarios atrasados",
        related: "Cliente recurrente",
        dueLabel: "Manana - 17:00",
        priority: "MEDIA",
        assignee: "Administracion",
        done: false,
      },
    ],
  });

  await prisma.procedure.create({
    data: {
      slug: "transferencia-ranger",
      type: "Transferencia",
      clientName: "Carlos Fernandez",
      vehicleLabel: "Ford Ranger 2019 - AE918KD",
      vehicleId: vehicleByPlate["AE918KD"].id,
      status: "PENDIENTE_DOCUMENTACION",
      priority: "URGENTE",
      jurisdiction: "La Pampa",
      targetDate: "08/04/2026",
      registryName: "Registro Santa Rosa 2",
      guideTitle: "Guia base de transferencia",
      guideSummary:
        "Controlar primero documentacion, firmas, verificacion y restricciones antes de mover carpeta. Si la jurisdiccion agrega requisitos, dejarlos asentados en notas.",
      contactId: contactByName["Carlos Fernandez"].id,
      requirements: {
        create: [
          { label: "Titulo del automotor", note: "Recibido y validado.", done: true },
          {
            label: "Firma certificada del vendedor",
            note: "Falta coordinar para hoy a la tarde.",
            done: false,
          },
          {
            label: "Libre deuda / validacion previa",
            note: "Chequeado parcialmente, falta confirmar cierre.",
            done: false,
          },
          { label: "Verificacion policial", note: "Realizada y archivada.", done: true },
        ],
      },
      timeline: {
        create: [
          {
            title: "Ingreso del tramite",
            description: "Se cargo cliente, vehiculo y checklist base.",
            dateLabel: "04/04/2026 - 11:20",
          },
          {
            title: "Revision documental",
            description: "Se detecto firma faltante del vendedor.",
            dateLabel: "05/04/2026 - 09:10",
          },
          {
            title: "Recordatorio al cliente",
            description: "Se aviso para coordinar firma.",
            dateLabel: "06/04/2026 - 08:45",
          },
        ],
      },
      movements: {
        create: [
          {
            label: "Cobro inicial",
            meta: "Honorarios de tramite - Caja gestoria",
            amount: "+ $ 320.000",
            type: "INGRESO",
            area: "GESTORIA",
          },
          {
            label: "Formularios",
            meta: "Aranceles - Caja gestoria",
            amount: "- $ 42.000",
            type: "EGRESO",
            area: "GESTORIA",
          },
        ],
      },
      notes: {
        create: [
          {
            body: "Separar en notas lo que es requisito nacional de lo que surge por practica local en La Pampa.",
          },
          {
            body: "No cerrar el tramite como terminado hasta tener trazabilidad de entrega al cliente.",
          },
        ],
      },
    },
  });

  await prisma.procedure.createMany({
    data: [
      {
        slug: "duplicado-gol",
        type: "Duplicado de cedula",
        clientName: "Mariana Lopez",
        vehicleLabel: "Volkswagen Gol 2016 - AC345TR",
        vehicleId: vehicleByPlate["AC345TR"].id,
        status: "PRESENTADO",
        priority: "MEDIA",
        jurisdiction: "Nacional",
        targetDate: "10/04/2026",
        contactId: contactByName["Mariana Lopez"].id,
      },
      {
        slug: "denuncia-venta",
        type: "Denuncia de venta",
        clientName: "Agencia Ruta 5",
        vehicleLabel: "Peugeot 208 2020 - AG552LM",
        vehicleId: vehicleByPlate["AG552LM"].id,
        status: "TERMINADO",
        priority: "ALTA",
        jurisdiction: "Buenos Aires",
        targetDate: "05/04/2026",
        contactId: contactByName["Agencia Ruta 5"].id,
      },
      {
        slug: "patentamiento-yaris",
        type: "Patentamiento",
        clientName: "Lucia Perez",
        vehicleLabel: "Toyota Yaris 0km - sin dominio",
        status: "OBSERVADO",
        priority: "URGENTE",
        jurisdiction: "La Pampa",
        targetDate: "07/04/2026",
      },
    ],
  });
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
