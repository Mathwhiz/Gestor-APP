import {
  contacts as mockContacts,
  guides as mockGuides,
  movements as mockMovements,
  procedureDetails as mockProcedureDetails,
  procedures as mockProcedures,
  tasks as mockTasks,
  ProcedureDetail,
  vehicles as mockVehicles,
  operations as mockOperations,
} from "@/data/mock-data";
import { getPrismaClient } from "@/lib/prisma";

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getContactsData(options?: { includeArchived?: boolean }) {
  if (!hasDatabase()) {
    return mockContacts.map((contact: (typeof mockContacts)[number]) => ({
      ...contact,
      archived: false,
    }));
  }
  const prisma = getPrismaClient();

  const contacts = await prisma.contact.findMany({
    where: options?.includeArchived ? undefined : { archivedAt: null },
    orderBy: [{ archivedAt: "asc" }, { createdAt: "desc" }],
  });
  return contacts.map((contact: (typeof contacts)[number]) => ({
    id: contact.id,
    name: contact.name,
    role: formatLabel(contact.role),
    document: contact.document ?? "Sin documentar",
    phone: contact.phone ?? "Sin telefono",
    location: contact.location ?? "Sin localidad",
    status: contact.archivedAt ? "Archivado" : formatLabel(contact.status),
    archived: Boolean(contact.archivedAt),
  }));
}

export async function getFinancialMovementsData() {
  if (!hasDatabase()) return mockMovements;
  const prisma = getPrismaClient();

  const movements = await prisma.financialMovement.findMany({ orderBy: { createdAt: "desc" } });
  return movements.map((movement: (typeof movements)[number]) => ({
    id: movement.id,
    date: movement.dateLabel,
    description: movement.description,
    category: movement.category,
    area: formatLabel(movement.area),
    account: movement.account,
    amount: movement.amount,
  }));
}

export async function getProceduresData() {
  if (!hasDatabase()) return mockProcedures;
  const prisma = getPrismaClient();

  const procedures = await prisma.procedure.findMany({ orderBy: { createdAt: "desc" } });
  return procedures.map((procedure: (typeof procedures)[number]) => ({
    id: procedure.slug,
    type: procedure.type,
    client: procedure.clientName,
    vehicle: procedure.vehicleLabel,
    status: formatProcedureStatus(procedure.status),
    statusTone: mapProcedureTone(procedure.status),
    priority: formatLabel(procedure.priority),
    jurisdiction: procedure.jurisdiction,
    targetDate: procedure.targetDate,
  }));
}

export async function getTasksData(options?: { includeArchived?: boolean }) {
  if (!hasDatabase()) {
    return mockTasks.map((task: (typeof mockTasks)[number]) => ({
      ...task,
      archived: false,
    }));
  }
  const prisma = getPrismaClient();

  const tasks = await prisma.task.findMany({
    where: options?.includeArchived ? undefined : { archivedAt: null },
    orderBy: [{ archivedAt: "asc" }, { createdAt: "desc" }],
  });
  return tasks.map((task: (typeof tasks)[number]) => ({
    id: task.id,
    title: task.title,
    related: task.related,
    dueLabel: task.dueLabel,
    priority: formatLabel(task.priority),
    assignee: task.assignee,
    tone: task.done ? ("success" as const) : mapTaskTone(task.priority),
    done: task.done,
    archived: Boolean(task.archivedAt),
  }));
}

export async function getGuidesData(options?: { includeArchived?: boolean }) {
  if (!hasDatabase()) {
    return mockGuides.map((guide: (typeof mockGuides)[number]) => ({
      ...guide,
      archived: false,
    }));
  }
  const prisma = getPrismaClient();

  const guides = await prisma.guide.findMany({
    where: options?.includeArchived ? undefined : { archivedAt: null },
    orderBy: [{ archivedAt: "asc" }, { createdAt: "desc" }],
  });
  return guides.map((guide: (typeof guides)[number]) => ({
    id: guide.id,
    title: guide.title,
    summary: guide.summary,
    scope: guide.scope,
    jurisdiction: guide.jurisdiction,
    lastUpdate: guide.lastUpdate,
    highlights: guide.highlights,
    archived: Boolean(guide.archivedAt),
  }));
}

export async function getVehiclesData(options?: { includeArchived?: boolean }) {
  if (!hasDatabase()) {
    return mockVehicles.map((vehicle: (typeof mockVehicles)[number]) => ({
      ...vehicle,
      archived: false,
    }));
  }
  const prisma = getPrismaClient();

  const vehicles = await prisma.vehicle.findMany({
    where: options?.includeArchived ? undefined : { archivedAt: null },
    orderBy: [{ archivedAt: "asc" }, { createdAt: "desc" }],
  });
  return vehicles.map((vehicle: (typeof vehicles)[number]) => ({
    id: vehicle.id,
    plate: vehicle.plate,
    name: vehicle.name,
    owner: vehicle.owner,
    area: formatVehicleArea(vehicle.area),
    status: formatVehicleStatus(vehicle.status),
    tone: mapVehicleTone(vehicle.status),
    note: vehicle.note,
    archived: Boolean(vehicle.archivedAt),
  }));
}

type VehicleDetail = {
  id: string;
  plate: string;
  name: string;
  owner: string;
  area: string;
  status: string;
  tone: "success" | "warning" | "danger" | "neutral" | "info";
  note: string;
  archived: boolean;
  procedures: {
    id: string;
    type: string;
    client: string;
    status: string;
    statusTone: "success" | "warning" | "danger" | "neutral" | "info";
    priority: string;
    targetDate: string;
  }[];
  operations: {
    id: string;
    type: string;
    status: string;
    tone: "success" | "warning" | "danger" | "neutral" | "info";
    buyer: string;
    seller: string;
    date: string;
    margin: string;
    note: string;
  }[];
};

export async function getVehicleDetailData(id: string): Promise<VehicleDetail | null> {
  if (!hasDatabase()) {
    const vehicle = mockVehicles.find((item: (typeof mockVehicles)[number]) => item.id === id);
    if (!vehicle) return null;

    return {
      ...vehicle,
      archived: false,
      procedures: mockProcedures
        .filter(
          (procedure: (typeof mockProcedures)[number]) =>
            procedure.vehicle.toLowerCase().includes(vehicle.plate.toLowerCase()) ||
            procedure.vehicle.toLowerCase().includes(vehicle.name.toLowerCase().split(" ")[0]),
        )
        .map((procedure: (typeof mockProcedures)[number]) => ({
          id: procedure.id,
          type: procedure.type,
          client: procedure.client,
          status: procedure.status,
          statusTone: procedure.statusTone,
          priority: procedure.priority,
          targetDate: procedure.targetDate,
        })),
      operations: mockOperations
        .filter(
          (operation: (typeof mockOperations)[number]) =>
            operation.vehicle.toLowerCase().includes(vehicle.plate.toLowerCase()) ||
            operation.vehicle.toLowerCase().includes(vehicle.name.toLowerCase().split(" ")[0]),
        )
        .map((operation: (typeof mockOperations)[number]) => ({
          id: operation.id,
          type: operation.type,
          status: operation.status,
          tone: operation.tone,
          buyer: operation.buyer,
          seller: operation.seller,
          date: operation.date,
          margin: operation.margin,
          note: operation.note,
        })),
    };
  }

  const prisma = getPrismaClient();
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      operations: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vehicle) return null;

  const procedures = await prisma.procedure.findMany({
    where: {
      OR: [
        { vehicleId: vehicle.id },
        { vehicleLabel: { contains: vehicle.plate, mode: "insensitive" } },
        { vehicleLabel: { contains: vehicle.name, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    id: vehicle.id,
    plate: vehicle.plate,
    name: vehicle.name,
    owner: vehicle.owner,
    area: formatVehicleArea(vehicle.area),
    status: formatVehicleStatus(vehicle.status),
    tone: mapVehicleTone(vehicle.status),
    note: vehicle.note,
    archived: Boolean(vehicle.archivedAt),
    procedures: procedures.map((procedure: (typeof procedures)[number]) => ({
      id: procedure.slug,
      type: procedure.type,
      client: procedure.clientName,
      status: formatProcedureStatus(procedure.status),
      statusTone: mapProcedureTone(procedure.status),
      priority: formatLabel(procedure.priority),
      targetDate: procedure.targetDate,
    })),
    operations: vehicle.operations.map((operation: (typeof vehicle.operations)[number]) => ({
      id: operation.id,
      type: formatLabel(operation.type),
      status: formatOperationStatus(operation.status),
      tone: mapOperationTone(operation.status),
      buyer: operation.buyerName ?? "Sin comprador",
      seller: operation.sellerName ?? "Sin vendedor",
      date: operation.dateLabel,
      margin: operation.margin,
      note: operation.notes ?? "Sin observaciones",
    })),
  };
}

type ContactDetail = {
  id: string;
  name: string;
  role: string;
  document: string;
  phone: string;
  location: string;
  status: string;
  archived: boolean;
  procedures: {
    id: string;
    type: string;
    vehicle: string;
    status: string;
    statusTone: "success" | "warning" | "danger" | "neutral" | "info";
    priority: string;
    targetDate: string;
  }[];
  operations: {
    id: string;
    type: string;
    vehicle: string;
    status: string;
    tone: "success" | "warning" | "danger" | "neutral" | "info";
    side: string;
    date: string;
    margin: string;
    note: string;
  }[];
};

export async function getContactDetailData(id: string): Promise<ContactDetail | null> {
  if (!hasDatabase()) {
    const contact = mockContacts.find((item: (typeof mockContacts)[number]) => item.id === id);
    if (!contact) return null;

    return {
      ...contact,
      archived: false,
      procedures: mockProcedures
        .filter((procedure: (typeof mockProcedures)[number]) => procedure.client === contact.name)
        .map((procedure: (typeof mockProcedures)[number]) => ({
          id: procedure.id,
          type: procedure.type,
          vehicle: procedure.vehicle,
          status: procedure.status,
          statusTone: procedure.statusTone,
          priority: procedure.priority,
          targetDate: procedure.targetDate,
        })),
      operations: mockOperations
        .filter(
          (operation: (typeof mockOperations)[number]) =>
            operation.buyer === contact.name || operation.seller === contact.name,
        )
        .map((operation: (typeof mockOperations)[number]) => ({
          id: operation.id,
          type: operation.type,
          vehicle: operation.vehicle,
          status: operation.status,
          tone: operation.tone,
          side: operation.buyer === contact.name ? "Comprador" : "Vendedor",
          date: operation.date,
          margin: operation.margin,
          note: operation.note,
        })),
    };
  }

  const prisma = getPrismaClient();
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      procedures: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!contact) return null;

  const operations = await prisma.operation.findMany({
    where: {
      OR: [{ buyerName: contact.name }, { sellerName: contact.name }],
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    id: contact.id,
    name: contact.name,
    role: formatLabel(contact.role),
    document: contact.document ?? "Sin documentar",
    phone: contact.phone ?? "Sin telefono",
    location: contact.location ?? "Sin localidad",
    status: contact.archivedAt ? "Archivado" : formatLabel(contact.status),
    archived: Boolean(contact.archivedAt),
    procedures: contact.procedures.map(
      (procedure: (typeof contact.procedures)[number]) => ({
      id: procedure.slug,
      type: procedure.type,
      vehicle: procedure.vehicleLabel,
      status: formatProcedureStatus(procedure.status),
      statusTone: mapProcedureTone(procedure.status),
      priority: formatLabel(procedure.priority),
      targetDate: procedure.targetDate,
      }),
    ),
    operations: operations.map((operation: (typeof operations)[number]) => ({
      id: operation.id,
      type: formatLabel(operation.type),
      vehicle: operation.vehicleLabel,
      status: formatOperationStatus(operation.status),
      tone: mapOperationTone(operation.status),
      side: operation.buyerName === contact.name ? "Comprador" : "Vendedor",
      date: operation.dateLabel,
      margin: operation.margin,
      note: operation.notes ?? "Sin observaciones",
    })),
  };
}

export async function getOperationsData() {
  if (!hasDatabase()) return mockOperations;
  const prisma = getPrismaClient();

  const operations = await prisma.operation.findMany({ orderBy: { createdAt: "desc" } });
  return operations.map((operation: (typeof operations)[number]) => ({
    id: operation.id,
    type: formatLabel(operation.type),
    vehicle: operation.vehicleLabel,
    buyer: operation.buyerName ?? "Sin comprador",
    seller: operation.sellerName ?? "Sin vendedor",
    date: operation.dateLabel,
    agreedPrice: operation.agreedPrice,
    realCost: operation.realCost,
    commission: operation.commission ?? "$ 0",
    margin: operation.margin,
    status: formatOperationStatus(operation.status),
    tone: mapOperationTone(operation.status),
    note: operation.notes ?? "Sin observaciones",
  }));
}

type OperationDetail = {
  id: string;
  type: string;
  vehicle: string;
  buyer: string;
  seller: string;
  date: string;
  agreedPrice: string;
  realCost: string;
  commission: string;
  margin: string;
  status: string;
  tone: "success" | "warning" | "danger" | "neutral" | "info";
  note: string;
  vehicleRef: { id: string; label: string } | null;
  buyerRef: { id: string; label: string } | null;
  sellerRef: { id: string; label: string } | null;
  relatedProcedures: {
    id: string;
    type: string;
    client: string;
    status: string;
    statusTone: "success" | "warning" | "danger" | "neutral" | "info";
    targetDate: string;
  }[];
};

export async function getOperationDetailData(id: string): Promise<OperationDetail | null> {
  if (!hasDatabase()) {
    const operation = mockOperations.find((item: (typeof mockOperations)[number]) => item.id === id);
    if (!operation) return null;

    const matchedVehicle = mockVehicles.find((vehicle: (typeof mockVehicles)[number]) =>
      operation.vehicle.toLowerCase().includes(vehicle.plate.toLowerCase()),
    );
    const relatedProcedures = mockProcedures
      .filter(
        (procedure: (typeof mockProcedures)[number]) =>
          procedure.vehicle.toLowerCase().includes(matchedVehicle?.plate.toLowerCase() ?? "") ||
          procedure.client === operation.buyer ||
          procedure.client === operation.seller,
      )
      .map((procedure: (typeof mockProcedures)[number]) => ({
        id: procedure.id,
        type: procedure.type,
        client: procedure.client,
        status: procedure.status,
        statusTone: procedure.statusTone,
        targetDate: procedure.targetDate,
      }));

    return {
      id: operation.id,
      type: operation.type,
      vehicle: operation.vehicle,
      buyer: operation.buyer,
      seller: operation.seller,
      date: operation.date,
      agreedPrice: operation.agreedPrice,
      realCost: operation.realCost,
      commission: operation.commission,
      margin: operation.margin,
      status: operation.status,
      tone: operation.tone,
      note: operation.note,
      vehicleRef: matchedVehicle
        ? { id: matchedVehicle.id, label: `${matchedVehicle.name} - ${matchedVehicle.plate}` }
        : null,
      buyerRef: null,
      sellerRef: null,
      relatedProcedures,
    };
  }

  const prisma = getPrismaClient();
  const operation = await prisma.operation.findUnique({
    where: { id },
    include: {
      vehicle: true,
      buyer: true,
      seller: true,
    },
  });

  if (!operation) return null;

  const relatedProcedures = await prisma.procedure.findMany({
    where: {
      OR: [
        operation.vehicleId ? { vehicleId: operation.vehicleId } : undefined,
        operation.buyerId ? { contactId: operation.buyerId } : undefined,
        operation.sellerId ? { contactId: operation.sellerId } : undefined,
        { vehicleLabel: { contains: operation.vehicleLabel, mode: "insensitive" } },
      ].filter(Boolean) as { vehicleId?: string; contactId?: string; vehicleLabel?: { contains: string; mode: "insensitive" } }[],
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    id: operation.id,
    type: formatLabel(operation.type),
    vehicle: operation.vehicleLabel,
    buyer: operation.buyerName ?? "Sin comprador",
    seller: operation.sellerName ?? "Sin vendedor",
    date: operation.dateLabel,
    agreedPrice: operation.agreedPrice,
    realCost: operation.realCost,
    commission: operation.commission ?? "$ 0",
    margin: operation.margin,
    status: formatOperationStatus(operation.status),
    tone: mapOperationTone(operation.status),
    note: operation.notes ?? "Sin observaciones",
    vehicleRef: operation.vehicle
      ? { id: operation.vehicle.id, label: `${operation.vehicle.name} - ${operation.vehicle.plate}` }
      : null,
    buyerRef: operation.buyer ? { id: operation.buyer.id, label: operation.buyer.name } : null,
    sellerRef: operation.seller ? { id: operation.seller.id, label: operation.seller.name } : null,
    relatedProcedures: relatedProcedures.map((procedure: (typeof relatedProcedures)[number]) => ({
      id: procedure.slug,
      type: procedure.type,
      client: procedure.clientName,
      status: formatProcedureStatus(procedure.status),
      statusTone: mapProcedureTone(procedure.status),
      targetDate: procedure.targetDate,
    })),
  };
}

export async function getDashboardData() {
  const [procedures, tasks, movements, guides, contacts, vehicles, operations] = await Promise.all([
    getProceduresData(),
    getTasksData(),
    getFinancialMovementsData(),
    getGuidesData(),
    getContactsData(),
    getVehiclesData(),
    getOperationsData(),
  ]);

  const urgentProcedures = procedures.filter(
    (procedure: (typeof procedures)[number]) =>
      procedure.priority === "Urgente" ||
      procedure.status === "Observado" ||
      procedure.status === "Pendiente de documentacion",
  );
  const pendingTasks = tasks.filter((task: (typeof tasks)[number]) => !("done" in task) || !task.done);
  const pendingCollections = movements
    .filter((movement: (typeof movements)[number]) => movement.amount.startsWith("+"))
    .reduce((total, movement: (typeof movements)[number]) => total + Number(movement.amount.replace(/[^\d-]/g, "")), 0);
  const openOperations = operations.filter(
    (operation: (typeof operations)[number]) => operation.status !== "Cerrada",
  );
  const cashBalance = movements.reduce((total, movement: (typeof movements)[number]) => {
    const amount = Number(movement.amount.replace(/[^\d-]/g, ""));
    return movement.amount.startsWith("+") ? total + amount : total - Math.abs(amount);
  }, 0);

  return {
    summaries: [
      {
        title: "Tramites urgentes",
        value: String(urgentProcedures.length),
        detail: "Incluye observados, urgentes y pendientes de documentacion.",
        accent: "#ad5f47",
      },
      {
        title: "Tareas pendientes",
        value: String(pendingTasks.length),
        detail: "Pendientes cortos para mover hoy y manana.",
        accent: "#b57628",
      },
      {
        title: "Caja operativa",
        value: `$ ${Math.abs(cashBalance).toLocaleString("es-AR")}`,
        detail: cashBalance >= 0 ? "Balance positivo considerando ingresos y egresos." : "Balance negativo con salida neta de caja.",
        accent: "#1f4f5f",
      },
      {
        title: "Operaciones activas",
        value: String(openOperations.length),
        detail: "Ventas, compras y consignaciones todavia abiertas.",
        accent: "#2b6f55",
      },
    ],
    procedures,
    tasks,
    movements,
    guides,
    operations,
    searchItems: [
      ...procedures.map((procedure: (typeof procedures)[number]) => ({
        id: procedure.id,
        title: procedure.type,
        meta: `${procedure.client} - ${procedure.vehicle}`,
        href: `/tramites/${procedure.id}`,
        kind: "tramite" as const,
      })),
      ...contacts.map((contact: (typeof contacts)[number]) => ({
        id: contact.id,
        title: contact.name,
        meta: `${contact.role} - ${contact.location}`,
        href: `/contactos/${contact.id}`,
        kind: "contacto" as const,
      })),
      ...vehicles.map((vehicle: (typeof vehicles)[number]) => ({
        id: vehicle.id,
        title: `${vehicle.name} - ${vehicle.plate}`,
        meta: `${vehicle.owner} - ${vehicle.status}`,
        href: `/vehiculos/${vehicle.id}`,
        kind: "vehiculo" as const,
      })),
      ...operations.map((operation: (typeof operations)[number]) => ({
        id: operation.id,
        title: `${operation.type} - ${operation.vehicle}`,
        meta: `${operation.buyer} / ${operation.seller} - ${operation.status}`,
        href: `/operaciones/${operation.id}`,
        kind: "operacion" as const,
      })),
    ],
    quickStats: {
      urgentProcedures: urgentProcedures.length,
      observedProcedures: procedures.filter(
        (procedure: (typeof procedures)[number]) => procedure.status === "Observado",
      ).length,
      pendingCollections,
      cashBalance,
    },
  };
}

export async function getProcedureDetailData(id: string): Promise<ProcedureDetail | null> {
  if (!hasDatabase()) return mockProcedureDetails[id] ?? null;
  const prisma = getPrismaClient();

  const procedure = await prisma.procedure.findUnique({
    where: { slug: id },
    include: {
      requirements: true,
      timeline: true,
      movements: true,
      notes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!procedure) return null;

  return {
    id: procedure.slug,
    title: `${procedure.type} - ${procedure.vehicleLabel}`,
    client: procedure.clientName,
    vehicle: procedure.vehicleLabel,
    registry: procedure.registryName ?? "Sin registro",
    summary: [
      {
        label: "Estado",
        value: formatProcedureStatus(procedure.status),
        tone: mapProcedureTone(procedure.status),
      },
      {
        label: "Prioridad",
        value: formatLabel(procedure.priority),
        tone: mapPriorityTone(procedure.priority),
      },
      { label: "Jurisdiccion", value: procedure.jurisdiction },
      { label: "Honorarios", value: "$ 0" },
    ],
    requirements: procedure.requirements.map((item) => ({
      label: item.label,
      note: item.note ?? "",
      done: item.done,
    })),
    timeline: procedure.timeline.map((item) => ({
      title: item.title,
      description: item.description,
      date: item.dateLabel,
    })),
    movements: procedure.movements.map((item) => ({
      label: item.label,
      meta: item.meta,
      amount: item.amount,
    })),
    guide: {
      title: procedure.guideTitle ?? "Guia base del tramite",
      summary: procedure.guideSummary ?? "Sin guia cargada en base de datos.",
      steps: ["Completar configuracion de este tramite en base real."],
      links: [],
    },
    notes: procedure.notes.map((item) => item.body),
  };
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatProcedureStatus(
  value: "BORRADOR" | "PENDIENTE_DOCUMENTACION" | "LISTO_PARA_PRESENTAR" | "PRESENTADO" | "OBSERVADO" | "TERMINADO",
) {
  switch (value) {
    case "PENDIENTE_DOCUMENTACION":
      return "Pendiente de documentacion";
    case "LISTO_PARA_PRESENTAR":
      return "Listo para presentar";
    case "PRESENTADO":
      return "Presentado";
    case "OBSERVADO":
      return "Observado";
    case "TERMINADO":
      return "Terminado";
    default:
      return "Borrador";
  }
}

function mapProcedureTone(
  value: "BORRADOR" | "PENDIENTE_DOCUMENTACION" | "LISTO_PARA_PRESENTAR" | "PRESENTADO" | "OBSERVADO" | "TERMINADO",
) {
  switch (value) {
    case "PENDIENTE_DOCUMENTACION":
      return "warning" as const;
    case "LISTO_PARA_PRESENTAR":
    case "PRESENTADO":
      return "info" as const;
    case "OBSERVADO":
      return "danger" as const;
    case "TERMINADO":
      return "success" as const;
    default:
      return "neutral" as const;
  }
}

function mapPriorityTone(value: string) {
  if (value === "URGENTE") return "danger" as const;
  if (value === "ALTA") return "warning" as const;
  return "info" as const;
}

function mapTaskTone(value: string) {
  if (value === "URGENTE") return "danger" as const;
  if (value === "ALTA") return "warning" as const;
  return "info" as const;
}

function formatVehicleArea(value: "GESTORIA" | "AGENCIA") {
  return value === "GESTORIA" ? "Gestoria" : "Agencia";
}

function formatVehicleStatus(value: "EN_TRAMITE" | "EN_STOCK" | "DOCUMENTACION_INCOMPLETA") {
  switch (value) {
    case "EN_TRAMITE":
      return "En tramite";
    case "EN_STOCK":
      return "En stock";
    default:
      return "Documentacion incompleta";
  }
}

function mapVehicleTone(value: "EN_TRAMITE" | "EN_STOCK" | "DOCUMENTACION_INCOMPLETA") {
  switch (value) {
    case "EN_TRAMITE":
      return "warning" as const;
    case "EN_STOCK":
      return "info" as const;
    default:
      return "danger" as const;
  }
}

function formatOperationStatus(value: "ABIERTA" | "RESERVADA" | "CERRADA" | "ANULADA") {
  switch (value) {
    case "ABIERTA":
      return "Abierta";
    case "RESERVADA":
      return "Reservada";
    case "CERRADA":
      return "Cerrada";
    default:
      return "Anulada";
  }
}

function mapOperationTone(value: "ABIERTA" | "RESERVADA" | "CERRADA" | "ANULADA") {
  switch (value) {
    case "ABIERTA":
      return "info" as const;
    case "RESERVADA":
      return "warning" as const;
    case "CERRADA":
      return "success" as const;
    default:
      return "danger" as const;
  }
}
