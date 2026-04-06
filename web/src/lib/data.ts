import {
  contacts as mockContacts,
  guides as mockGuides,
  movements as mockMovements,
  procedureDetails as mockProcedureDetails,
  procedures as mockProcedures,
  summaries as mockSummaries,
  tasks as mockTasks,
  ProcedureDetail,
} from "@/data/mock-data";
import { getPrismaClient } from "@/lib/prisma";

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getContactsData() {
  if (!hasDatabase()) return mockContacts;
  const prisma = getPrismaClient();

  const contacts = await prisma.contact.findMany({ orderBy: { createdAt: "desc" } });
  return contacts.map((contact) => ({
    id: contact.id,
    name: contact.name,
    role: formatLabel(contact.role),
    document: contact.document ?? "Sin documentar",
    phone: contact.phone ?? "Sin telefono",
    location: contact.location ?? "Sin localidad",
    status: formatLabel(contact.status),
  }));
}

export async function getFinancialMovementsData() {
  if (!hasDatabase()) return mockMovements;
  const prisma = getPrismaClient();

  const movements = await prisma.financialMovement.findMany({ orderBy: { createdAt: "desc" } });
  return movements.map((movement) => ({
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
  return procedures.map((procedure) => ({
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

export async function getTasksData() {
  if (!hasDatabase()) return mockTasks;
  const prisma = getPrismaClient();

  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    related: task.related,
    dueLabel: task.dueLabel,
    priority: formatLabel(task.priority),
    assignee: task.assignee,
    tone: task.done ? ("success" as const) : mapTaskTone(task.priority),
    done: task.done,
  }));
}

export async function getGuidesData() {
  if (!hasDatabase()) return mockGuides;
  const prisma = getPrismaClient();

  const guides = await prisma.guide.findMany({ orderBy: { createdAt: "desc" } });
  return guides.map((guide) => ({
    id: guide.id,
    title: guide.title,
    summary: guide.summary,
    scope: guide.scope,
    jurisdiction: guide.jurisdiction,
    lastUpdate: guide.lastUpdate,
    highlights: guide.highlights,
  }));
}

export async function getDashboardData() {
  const [procedures, tasks, movements, guides] = await Promise.all([
    getProceduresData(),
    getTasksData(),
    getFinancialMovementsData(),
    getGuidesData(),
  ]);

  return {
    summaries: mockSummaries,
    procedures,
    tasks,
    movements,
    guides,
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
