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
import { getProcedureTemplate } from "@/lib/procedure-templates";

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

export async function getFinancialMovementsData(options?: { includeArchived?: boolean }) {
  if (!hasDatabase()) {
    return mockMovements.map((movement: (typeof mockMovements)[number]) => ({
      ...movement,
      archived: false,
    }));
  }
  const prisma = getPrismaClient();

  const movements = await prisma.financialMovement.findMany({
    where: options?.includeArchived ? undefined : { archivedAt: null },
    orderBy: [{ archivedAt: "asc" }, { createdAt: "desc" }],
  });
  return movements.map((movement: (typeof movements)[number]) => ({
    id: movement.id,
    date: movement.dateLabel,
    description: movement.description,
    category: movement.category,
    area: formatLabel(movement.area),
    account: movement.account,
    amount: movement.amount,
    archived: Boolean(movement.archivedAt),
  }));
}

type FinanceInsights = {
  areaBalances: { area: string; balance: number }[];
  topIncomeCategories: { category: string; amount: number }[];
  topExpenseCategories: { category: string; amount: number }[];
  proceduresWithoutIncome: number;
  observedProcedures: number;
  proceduresPendingDocs: number;
  openOperationsMargin: number;
  pendingCollectionProcedures: {
    id: string;
    type: string;
    client: string;
    status: string;
    priority: string;
    targetDate: string;
  }[];
  monthlyReport: {
    monthLabel: string;
    totalIncome: number;
    totalExpense: number;
    net: number;
    byArea: { area: string; balance: number }[];
    activeProcedures: number;
    openOperations: number;
  };
};

export async function getFinanceInsightsData(): Promise<FinanceInsights> {
  const [movements, procedures, operations] = await Promise.all([
    getFinancialMovementsData(),
    hasDatabase()
      ? getPrismaClient().procedure.findMany({
          where: { archivedAt: null },
          include: {
            movements: true,
          },
        })
      : Promise.resolve([]),
    hasDatabase()
      ? getPrismaClient().operation.findMany({ where: { archivedAt: null } })
      : Promise.resolve([]),
  ]);

  const areaBalances = ["Gestoria", "Agencia", "General", "Personal"].map((area) => {
    const balance = movements
      .filter((item: (typeof movements)[number]) => item.area === area)
      .reduce((total: number, item: (typeof movements)[number]) => {
        const numeric = Number(item.amount.replace(/[^\d-]/g, ""));
        return item.amount.startsWith("+") ? total + numeric : total - Math.abs(numeric);
      }, 0);

    return { area, balance };
  });

  function accumulateCategories(kind: "income" | "expense") {
    const map = new Map<string, number>();

    movements
      .filter((item: (typeof movements)[number]) =>
        kind === "income" ? item.amount.startsWith("+") : item.amount.startsWith("-"),
      )
      .forEach((item: (typeof movements)[number]) => {
        const numeric = Math.abs(Number(item.amount.replace(/[^\d-]/g, "")));
        map.set(item.category, (map.get(item.category) ?? 0) + numeric);
      });

    return [...map.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }

  if (!hasDatabase()) {
    const monthlyMovements = filterItemsInCurrentMonth(mockMovements, (item) => item.date);
    const monthlyIncome = monthlyMovements
      .filter((item: (typeof monthlyMovements)[number]) => item.amount.startsWith("+"))
      .reduce((total: number, item: (typeof monthlyMovements)[number]) => total + Math.abs(Number(item.amount.replace(/[^\d-]/g, ""))), 0);
    const monthlyExpense = monthlyMovements
      .filter((item: (typeof monthlyMovements)[number]) => item.amount.startsWith("-"))
      .reduce((total: number, item: (typeof monthlyMovements)[number]) => total + Math.abs(Number(item.amount.replace(/[^\d-]/g, ""))), 0);
    return {
      areaBalances,
      topIncomeCategories: accumulateCategories("income"),
      topExpenseCategories: accumulateCategories("expense"),
      proceduresWithoutIncome: mockProcedures.filter(
        (procedure: (typeof mockProcedures)[number]) =>
          procedure.status !== "Terminado" && procedure.status !== "Borrador",
      ).length,
      observedProcedures: mockProcedures.filter(
        (procedure: (typeof mockProcedures)[number]) => procedure.status === "Observado",
      ).length,
      proceduresPendingDocs: mockProcedures.filter(
        (procedure: (typeof mockProcedures)[number]) =>
          procedure.status === "Pendiente de documentacion",
      ).length,
      openOperationsMargin: mockOperations
        .filter((operation: (typeof mockOperations)[number]) => operation.status !== "Cerrada")
        .reduce(
          (total: number, operation: (typeof mockOperations)[number]) =>
            total + Number(operation.margin.replace(/[^\d-]/g, "")),
          0,
        ),
      pendingCollectionProcedures: mockProcedures
        .filter(
          (procedure: (typeof mockProcedures)[number]) =>
            procedure.status !== "Terminado" && procedure.status !== "Borrador",
        )
        .slice(0, 5)
        .map((procedure: (typeof mockProcedures)[number]) => ({
          id: procedure.id,
          type: procedure.type,
          client: procedure.client,
          status: procedure.status,
          priority: procedure.priority,
          targetDate: procedure.targetDate,
        })),
      monthlyReport: {
        monthLabel: formatCurrentMonthLabel(),
        totalIncome: monthlyIncome,
        totalExpense: monthlyExpense,
        net: monthlyIncome - monthlyExpense,
        byArea: ["Gestoria", "Agencia", "General", "Personal"].map((area) => ({
          area,
          balance: monthlyMovements
            .filter((item: (typeof monthlyMovements)[number]) => item.area === area)
            .reduce((total: number, item: (typeof monthlyMovements)[number]) => {
              const numeric = Number(item.amount.replace(/[^\d-]/g, ""));
              return item.amount.startsWith("+") ? total + numeric : total - Math.abs(numeric);
            }, 0),
        })),
        activeProcedures: mockProcedures.filter((procedure: (typeof mockProcedures)[number]) => procedure.status !== "Terminado").length,
        openOperations: mockOperations.filter((operation: (typeof mockOperations)[number]) => operation.status !== "Cerrada").length,
      },
    };
  }

  const proceduresWithoutIncome = procedures.filter((procedure: (typeof procedures)[number]) => {
    const hasPositiveMovement = procedure.movements.some((movement) => movement.amount.startsWith("+"));
    return (
      procedure.status !== "TERMINADO" &&
      procedure.status !== "BORRADOR" &&
      !hasPositiveMovement
    );
  }).length;

  const observedProcedures = procedures.filter(
    (procedure: (typeof procedures)[number]) => procedure.status === "OBSERVADO",
  ).length;

  const proceduresPendingDocs = procedures.filter(
    (procedure: (typeof procedures)[number]) => procedure.status === "PENDIENTE_DOCUMENTACION",
  ).length;

  const openOperationsMargin = operations
    .filter((operation: (typeof operations)[number]) => operation.status !== "CERRADA")
    .reduce(
      (total: number, operation: (typeof operations)[number]) =>
        total + Number(operation.margin.replace(/[^\d-]/g, "")),
      0,
    );

  return {
    areaBalances,
    topIncomeCategories: accumulateCategories("income"),
    topExpenseCategories: accumulateCategories("expense"),
    proceduresWithoutIncome,
    observedProcedures,
    proceduresPendingDocs,
    openOperationsMargin,
    pendingCollectionProcedures: procedures
      .filter((procedure: (typeof procedures)[number]) => {
        const hasPositiveMovement = procedure.movements.some((movement) => movement.amount.startsWith("+"));
        return (
          procedure.status !== "TERMINADO" &&
          procedure.status !== "BORRADOR" &&
          !hasPositiveMovement
        );
      })
      .slice(0, 6)
      .map((procedure: (typeof procedures)[number]) => ({
        id: procedure.slug,
        type: procedure.type,
        client: procedure.clientName,
        status: formatProcedureStatus(procedure.status),
        priority: formatLabel(procedure.priority),
        targetDate: procedure.targetDate,
      })),
    monthlyReport: buildMonthlyFinanceReport(movements, procedures, operations),
  };
}

export async function getProceduresData(options?: { includeArchived?: boolean }) {
  if (!hasDatabase()) {
    return mockProcedures.map((procedure: (typeof mockProcedures)[number]) => ({
      ...procedure,
      archived: false,
    }));
  }
  const prisma = getPrismaClient();

  const procedures = await prisma.procedure.findMany({
    where: options?.includeArchived ? undefined : { archivedAt: null },
    orderBy: [{ archivedAt: "asc" }, { createdAt: "desc" }],
  });
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
    archived: Boolean(procedure.archivedAt),
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
  timeline: {
    id: string;
    title: string;
    meta: string;
    date: string;
    href: string;
    tone: "success" | "warning" | "danger" | "neutral" | "info";
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
      timeline: [
        ...mockProcedures
          .filter(
            (procedure: (typeof mockProcedures)[number]) =>
              procedure.vehicle.toLowerCase().includes(vehicle.plate.toLowerCase()) ||
              procedure.vehicle.toLowerCase().includes(vehicle.name.toLowerCase().split(" ")[0]),
          )
          .map((procedure: (typeof mockProcedures)[number]) => ({
            id: `procedure-${procedure.id}`,
            title: procedure.type,
            meta: `${procedure.client} · ${procedure.status}`,
            date: procedure.targetDate,
            href: `/tramites/${procedure.id}`,
            tone: procedure.statusTone,
          })),
        ...mockOperations
          .filter(
            (operation: (typeof mockOperations)[number]) =>
              operation.vehicle.toLowerCase().includes(vehicle.plate.toLowerCase()) ||
              operation.vehicle.toLowerCase().includes(vehicle.name.toLowerCase().split(" ")[0]),
          )
          .map((operation: (typeof mockOperations)[number]) => ({
            id: `operation-${operation.id}`,
            title: operation.type,
            meta: `${operation.buyer} / ${operation.seller} · ${operation.status}`,
            date: operation.date,
            href: `/operaciones/${operation.id}`,
            tone: operation.tone,
          })),
      ].sort((a, b) => compareDateLabelsDesc(a.date, b.date)),
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
    timeline: [
      ...procedures.map((procedure: (typeof procedures)[number]) => ({
        id: `procedure-${procedure.slug}`,
        title: procedure.type,
        meta: `${procedure.clientName} · ${formatProcedureStatus(procedure.status)}`,
        date: procedure.targetDate,
        href: `/tramites/${procedure.slug}`,
        tone: mapProcedureTone(procedure.status),
      })),
      ...vehicle.operations.map((operation: (typeof vehicle.operations)[number]) => ({
        id: `operation-${operation.id}`,
        title: formatLabel(operation.type),
        meta: `${operation.buyerName ?? "Sin comprador"} / ${operation.sellerName ?? "Sin vendedor"} · ${formatOperationStatus(operation.status)}`,
        date: operation.dateLabel,
        href: `/operaciones/${operation.id}`,
        tone: mapOperationTone(operation.status),
      })),
    ].sort((a, b) => compareDateLabelsDesc(a.date, b.date)),
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
  timeline: {
    id: string;
    title: string;
    meta: string;
    date: string;
    href: string;
    tone: "success" | "warning" | "danger" | "neutral" | "info";
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
      timeline: [
        ...mockProcedures
          .filter((procedure: (typeof mockProcedures)[number]) => procedure.client === contact.name)
          .map((procedure: (typeof mockProcedures)[number]) => ({
            id: `procedure-${procedure.id}`,
            title: procedure.type,
            meta: `${procedure.vehicle} · ${procedure.status}`,
            date: procedure.targetDate,
            href: `/tramites/${procedure.id}`,
            tone: procedure.statusTone,
          })),
        ...mockOperations
          .filter(
            (operation: (typeof mockOperations)[number]) =>
              operation.buyer === contact.name || operation.seller === contact.name,
          )
          .map((operation: (typeof mockOperations)[number]) => ({
            id: `operation-${operation.id}`,
            title: operation.type,
            meta: `${operation.vehicle} · ${operation.status}`,
            date: operation.date,
            href: `/operaciones/${operation.id}`,
            tone: operation.tone,
          })),
      ].sort((a, b) => compareDateLabelsDesc(a.date, b.date)),
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
    timeline: [
      ...contact.procedures.map((procedure: (typeof contact.procedures)[number]) => ({
        id: `procedure-${procedure.slug}`,
        title: procedure.type,
        meta: `${procedure.vehicleLabel} · ${formatProcedureStatus(procedure.status)}`,
        date: procedure.targetDate,
        href: `/tramites/${procedure.slug}`,
        tone: mapProcedureTone(procedure.status),
      })),
      ...operations.map((operation: (typeof operations)[number]) => ({
        id: `operation-${operation.id}`,
        title: formatLabel(operation.type),
        meta: `${operation.vehicleLabel} · ${formatOperationStatus(operation.status)}`,
        date: operation.dateLabel,
        href: `/operaciones/${operation.id}`,
        tone: mapOperationTone(operation.status),
      })),
    ].sort((a, b) => compareDateLabelsDesc(a.date, b.date)),
  };
}

export async function getOperationsData(options?: { includeArchived?: boolean }) {
  if (!hasDatabase()) {
    return mockOperations.map((operation: (typeof mockOperations)[number]) => ({
      ...operation,
      archived: false,
    }));
  }
  const prisma = getPrismaClient();

  const operations = await prisma.operation.findMany({
    where: options?.includeArchived ? undefined : { archivedAt: null },
    orderBy: [{ archivedAt: "asc" }, { createdAt: "desc" }],
  });
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
    archived: Boolean(operation.archivedAt),
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
  alerts: {
    title: string;
    detail: string;
    tone: "success" | "warning" | "danger" | "neutral" | "info";
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
      alerts: buildOperationAlerts({
        status: operation.status,
        buyer: operation.buyer,
        seller: operation.seller,
        relatedProcedures,
        margin: operation.margin,
      }),
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
    alerts: buildOperationAlerts({
      status: formatOperationStatus(operation.status),
      buyer: operation.buyerName ?? "Sin comprador",
      seller: operation.sellerName ?? "Sin vendedor",
      relatedProcedures: relatedProcedures.map((procedure: (typeof relatedProcedures)[number]) => ({
        id: procedure.slug,
        type: procedure.type,
        client: procedure.clientName,
        status: formatProcedureStatus(procedure.status),
        statusTone: mapProcedureTone(procedure.status),
        targetDate: procedure.targetDate,
      })),
      margin: operation.margin,
    }),
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
    .reduce(
      (total: number, movement: (typeof movements)[number]) =>
        total + Number(movement.amount.replace(/[^\d-]/g, "")),
      0,
    );
  const openOperations = operations.filter(
    (operation: (typeof operations)[number]) => operation.status !== "Cerrada",
  );
  const proceduresMissingDocs = procedures.filter(
    (procedure: (typeof procedures)[number]) => procedure.status === "Pendiente de documentacion",
  );
  const blockedProcedures = procedures.filter(
    (procedure: (typeof procedures)[number]) => procedure.status === "Observado",
  );
  const completedTasks = tasks.filter((task: (typeof tasks)[number]) => "done" in task && task.done);
  const cashBalance = movements.reduce((total: number, movement: (typeof movements)[number]) => {
    const amount = Number(movement.amount.replace(/[^\d-]/g, ""));
    return movement.amount.startsWith("+") ? total + amount : total - Math.abs(amount);
  }, 0);
  const todayDate = getCurrentBuenosAiresDate();
  const overdueProcedures = procedures.filter((procedure: (typeof procedures)[number]) => {
    const parsed = parseDateLabel(procedure.targetDate);
    return parsed !== null && parsed.getTime() < todayDate.getTime() && procedure.status !== "Terminado";
  });
  const todayAgenda = tasks.filter((task: (typeof tasks)[number]) =>
    normalizeLookup(task.dueLabel).includes("hoy"),
  );
  const areaReport = ["Gestoria", "Agencia", "General", "Personal"].map((area) => {
    const balance = movements
      .filter((movement: (typeof movements)[number]) => movement.area === area)
      .reduce((total: number, movement: (typeof movements)[number]) => {
        const numeric = Number(movement.amount.replace(/[^\d-]/g, ""));
        return movement.amount.startsWith("+") ? total + numeric : total - Math.abs(numeric);
      }, 0);

    return { area, balance };
  });
  const totalOpenMargin = openOperations.reduce(
    (total: number, operation: (typeof openOperations)[number]) =>
      total + Number(operation.margin.replace(/[^\d-]/g, "")),
    0,
  );
  const operationalAlerts = [
    {
      title: "Vencidos o pasados de fecha",
      value: overdueProcedures.length,
      detail:
        overdueProcedures.length > 0
          ? "Hay tramites cuyo objetivo ya quedo atras."
          : "No hay tramites vencidos cargados.",
      tone: overdueProcedures.length > 0 ? ("danger" as const) : ("success" as const),
    },
    {
      title: "Agenda para hoy",
      value: todayAgenda.length,
      detail: "Tareas marcadas para hoy en la agenda operativa.",
      tone: todayAgenda.length > 0 ? ("warning" as const) : ("neutral" as const),
    },
    {
      title: "Margen abierto",
      value: totalOpenMargin,
      detail: "Margen todavia no realizado en operaciones activas.",
      tone: "info" as const,
    },
  ];
  const dailyFocus = [
    ...tasks
      .filter((task: (typeof tasks)[number]) => !task.archived && !("done" in task && task.done))
      .slice(0, 4)
      .map((task: (typeof tasks)[number]) => ({
        id: task.id,
        title: task.title,
        meta: `${task.related} · ${task.dueLabel}`,
        href: "/tareas",
        tone: task.tone,
        kind: "tarea" as const,
      })),
    ...urgentProcedures.slice(0, 4).map((procedure: (typeof procedures)[number]) => ({
      id: procedure.id,
      title: procedure.type,
      meta: `${procedure.client} · ${procedure.targetDate}`,
      href: `/tramites/${procedure.id}`,
      tone: procedure.statusTone,
      kind: "tramite" as const,
    })),
    ...openOperations.slice(0, 3).map((operation: (typeof operations)[number]) => ({
      id: operation.id,
      title: `${operation.type} - ${operation.vehicle}`,
      meta: `${operation.status} · margen ${operation.margin}`,
      href: `/operaciones/${operation.id}`,
      tone: operation.tone,
      kind: "operacion" as const,
    })),
  ].slice(0, 8);
  const monthlyOverview = buildMonthlyFinanceReport(movements, procedures, operations);

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
        detail:
          completedTasks.length > 0
            ? `${completedTasks.length} completadas y ${pendingTasks.length} todavia activas.`
            : "Pendientes cortos para mover hoy y manana.",
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
    areaReport,
    operationalAlerts,
    dailyFocus,
    monthlyOverview,
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
      ...tasks
        .filter((task: (typeof tasks)[number]) => !task.archived)
        .map((task: (typeof tasks)[number]) => ({
          id: task.id,
          title: task.title,
          meta: `${task.related} - ${task.dueLabel}`,
          href: "/tareas",
          kind: "tarea" as const,
        })),
      ...guides
        .filter((guide: (typeof guides)[number]) => !guide.archived)
        .map((guide: (typeof guides)[number]) => ({
          id: guide.id,
          title: guide.title,
          meta: `${guide.scope} - ${guide.jurisdiction}`,
          href: "/ayudas",
          kind: "guia" as const,
        })),
    ],
    quickStats: {
      urgentProcedures: urgentProcedures.length,
      observedProcedures: blockedProcedures.length,
      missingDocuments: proceduresMissingDocs.length,
      pendingTasks: pendingTasks.length,
      openOperations: openOperations.length,
      pendingCollections,
      cashBalance,
    },
  };
}

function buildMonthlyFinanceReport(
  movements: { date: string; amount: string; area: string }[],
  procedures: { status: string }[],
  operations: { status: string }[],
) {
  const monthlyMovements = filterItemsInCurrentMonth(movements, (item) => item.date);
  const totalIncome = monthlyMovements
    .filter((item) => item.amount.startsWith("+"))
    .reduce((total, item) => total + Math.abs(Number(item.amount.replace(/[^\d-]/g, ""))), 0);
  const totalExpense = monthlyMovements
    .filter((item) => item.amount.startsWith("-"))
    .reduce((total, item) => total + Math.abs(Number(item.amount.replace(/[^\d-]/g, ""))), 0);

  return {
    monthLabel: formatCurrentMonthLabel(),
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    byArea: ["Gestoria", "Agencia", "General", "Personal"].map((area) => ({
      area,
      balance: monthlyMovements
        .filter((item) => item.area === area)
        .reduce((total, item) => {
          const numeric = Number(item.amount.replace(/[^\d-]/g, ""));
          return item.amount.startsWith("+") ? total + numeric : total - Math.abs(numeric);
        }, 0),
    })),
    activeProcedures: procedures.filter((procedure) => procedure.status !== "Terminado").length,
    openOperations: operations.filter((operation) => operation.status !== "Cerrada").length,
  };
}

export async function getProcedureDetailData(id: string): Promise<ProcedureDetail | null> {
  if (!hasDatabase()) {
    const mock = mockProcedureDetails[id] ?? null;
    if (!mock) return null;
    const targetDate = mock.summary.find((item) => item.label === "Objetivo")?.value ?? "Sin fecha";
    const alerts = buildProcedureAlerts({
      status: mock.summary.find((item) => item.label === "Estado")?.value ?? "Borrador",
      targetDate,
      requirements: mock.requirements.map((item) => ({ label: item.label, done: item.done })),
      movements: mock.movements,
    });
    return {
      ...mock,
      alerts,
      templateName: getProcedureTemplate(mock.title.split(" - ")[0]).type,
    };
  }
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

  const matchingGuide = await prisma.guide.findFirst({
    where: {
      archivedAt: null,
      OR: [
        { title: { equals: procedure.type, mode: "insensitive" } },
        { title: { contains: procedure.type, mode: "insensitive" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
  });

  const positiveTotal = procedure.movements
    .filter((item: (typeof procedure.movements)[number]) => item.amount.startsWith("+"))
    .reduce((total: number, item: (typeof procedure.movements)[number]) => {
      return total + Number(item.amount.replace(/[^\d-]/g, ""));
    }, 0);

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
      { label: "Honorarios", value: `$ ${positiveTotal.toLocaleString("es-AR")}` },
    ],
    requirements: procedure.requirements.map((item: (typeof procedure.requirements)[number]) => ({
      label: item.label,
      note: item.note ?? "",
      done: item.done,
    })),
    timeline: procedure.timeline.map((item: (typeof procedure.timeline)[number]) => ({
      title: item.title,
      description: item.description,
      date: item.dateLabel,
    })),
    movements: procedure.movements.map((item: (typeof procedure.movements)[number]) => ({
      label: item.label,
      meta: item.meta,
      amount: item.amount,
    })),
    guide: {
      title: matchingGuide?.title ?? procedure.guideTitle ?? "Guia base del tramite",
      summary:
        matchingGuide?.summary ??
        procedure.guideSummary ??
        "Sin guia cargada en base de datos.",
      steps:
        matchingGuide?.highlights.length
          ? matchingGuide.highlights
          : ["Completar configuracion de este tramite en base real."],
      links: [
        {
          label: "Abrir centro de ayudas",
          href: "/ayudas",
        },
      ],
    },
    notes: procedure.notes.map((item: (typeof procedure.notes)[number]) => item.body),
    alerts: buildProcedureAlerts({
      status: formatProcedureStatus(procedure.status),
      targetDate: procedure.targetDate,
      requirements: procedure.requirements.map((item: (typeof procedure.requirements)[number]) => ({
        label: item.label,
        done: item.done,
      })),
      movements: procedure.movements.map((item: (typeof procedure.movements)[number]) => ({
        label: item.label,
        meta: item.meta,
        amount: item.amount,
      })),
    }),
    templateName: getProcedureTemplate(procedure.type).type,
  };
}

function getCurrentBuenosAiresDate() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [year, month, day] = formatter.format(new Date()).split("-");
  return new Date(`${year}-${month}-${day}T00:00:00`);
}

function parseDateLabel(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(`${year}-${month}-${day}T00:00:00`);
}

function compareDateLabelsDesc(a: string, b: string) {
  const aDate = parseDateLabel(a);
  const bDate = parseDateLabel(b);
  if (!aDate && !bDate) return 0;
  if (!aDate) return 1;
  if (!bDate) return -1;
  return bDate.getTime() - aDate.getTime();
}

function daysUntil(value: string) {
  const target = parseDateLabel(value);
  if (!target) return null;
  const today = getCurrentBuenosAiresDate();
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function filterItemsInCurrentMonth<T>(items: T[], getDateLabel: (item: T) => string) {
  const today = getCurrentBuenosAiresDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  return items.filter((item) => {
    const parsed = parseDateLabel(getDateLabel(item));
    return parsed !== null && parsed.getMonth() === currentMonth && parsed.getFullYear() === currentYear;
  });
}

function formatCurrentMonthLabel() {
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
}

function buildProcedureAlerts(input: {
  status: string;
  targetDate: string;
  requirements: { label: string; done: boolean }[];
  movements: { label: string; meta: string; amount: string }[];
}) {
  const pendingRequirements = input.requirements.filter((item) => !item.done).length;
  const incomeCount = input.movements.filter((item) => item.amount.startsWith("+")).length;
  const remainingDays = daysUntil(input.targetDate);
  const alerts = [];

  if (input.status === "Observado") {
    alerts.push({
      title: "Observacion abierta",
      detail: "Conviene revisar el expediente antes de seguir sumando pasos.",
      tone: "danger" as const,
    });
  }
  if (pendingRequirements > 0) {
    alerts.push({
      title: `${pendingRequirements} requisito${pendingRequirements === 1 ? "" : "s"} pendiente${pendingRequirements === 1 ? "" : "s"}`,
      detail: "Todavia falta documentacion para cerrar o presentar con menos riesgo.",
      tone: "warning" as const,
    });
  }
  if (incomeCount === 0 && input.status !== "Terminado" && input.status !== "Borrador") {
    alerts.push({
      title: "Sin cobro cargado",
      detail: "El tramite sigue activo pero no tiene ingreso vinculado.",
      tone: "warning" as const,
    });
  }
  if (remainingDays !== null) {
    if (remainingDays < 0) {
      alerts.push({
        title: "Objetivo vencido",
        detail: `La fecha objetivo ${input.targetDate} ya paso.`,
        tone: "danger" as const,
      });
    } else if (remainingDays <= 1) {
      alerts.push({
        title: "Vence enseguida",
        detail: `La fecha objetivo ${input.targetDate} esta muy cerca.`,
        tone: "warning" as const,
      });
    }
  }

  return alerts;
}

function buildOperationAlerts(input: {
  status: string;
  buyer: string;
  seller: string;
  relatedProcedures: { status: string; targetDate: string }[];
  margin: string;
}) {
  const alerts = [];
  const observedRelated = input.relatedProcedures.filter((item) => item.status === "Observado").length;
  const pendingRelated = input.relatedProcedures.filter((item) => item.status === "Pendiente de documentacion").length;
  const numericMargin = Number(input.margin.replace(/[^\d-]/g, ""));

  if (input.status === "Reservada") {
    alerts.push({
      title: "Reserva sin cierre",
      detail: "Conviene seguir cobro, documentacion y fecha prometida.",
      tone: "warning" as const,
    });
  }
  if (input.status === "Abierta" && input.buyer === "Sin comprador") {
    alerts.push({
      title: "Sin comprador confirmado",
      detail: "La operacion sigue abierta sin una contraparte cargada.",
      tone: "warning" as const,
    });
  }
  if (input.status === "Abierta" && input.seller === "Sin vendedor") {
    alerts.push({
      title: "Sin vendedor confirmado",
      detail: "Falta cerrar de quien entra o sale la unidad.",
      tone: "warning" as const,
    });
  }
  if (observedRelated > 0 || pendingRelated > 0) {
    alerts.push({
      title: "Tramites vinculados con friccion",
      detail: `${observedRelated} observados y ${pendingRelated} con documentacion pendiente.`,
      tone: observedRelated > 0 ? ("danger" as const) : ("warning" as const),
    });
  }
  if (numericMargin > 0) {
    alerts.push({
      title: "Margen proyectado",
      detail: `$ ${numericMargin.toLocaleString("es-AR")} todavia no realizado.`,
      tone: "info" as const,
    });
  }

  return alerts;
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeLookup(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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
