"use server";

import { revalidatePath } from "next/cache";
import { canEditRole, requireAuthenticatedAppUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

function forbiddenResult() {
  return { ok: false as const, error: "No tenes permiso para editar." };
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeLookup(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isSignedAmount(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("+") || trimmed.startsWith("-");
}

function hasDigits(value: string) {
  return /\d/.test(value);
}

function isValidCurrencyInput(value: string, { signed = false }: { signed?: boolean } = {}) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (signed && !isSignedAmount(trimmed)) return false;
  return hasDigits(trimmed);
}

function isValidDateLabel(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(trimmed);
}

function isValidPhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^[\d\s()+-]{6,}$/.test(trimmed) && hasDigits(trimmed);
}

function isValidDocument(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^[A-Za-z0-9./-]{6,20}$/.test(trimmed);
}

function normalizePlate(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function isValidPlate(value: string) {
  const normalized = normalizePlate(value);
  return /^[A-Z0-9-]{6,8}$/.test(normalized);
}

function getBuenosAiresDateTimeLabel() {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
}

async function resolveContactIdByName(name: string) {
  const normalized = normalizeLookup(name);
  if (!normalized) return null;

  const prisma = getPrismaClient();
  const contacts = await prisma.contact.findMany({
    where: { archivedAt: null },
    select: { id: true, name: true },
  });

  const match = contacts.find((contact: { id: string; name: string }) => normalizeLookup(contact.name) === normalized);
  return match?.id ?? null;
}

async function resolveVehicleByLabel(label: string) {
  const normalized = normalizeLookup(label);
  if (!normalized) return null;

  const prisma = getPrismaClient();
  const vehicles = await prisma.vehicle.findMany({
    where: { archivedAt: null },
    select: { id: true, plate: true, name: true },
  });

  const exactPlate = vehicles.find((vehicle: { id: string; plate: string; name: string }) => normalized.includes(normalizeLookup(vehicle.plate)));
  if (exactPlate) return exactPlate;

  const exactName = vehicles.find((vehicle: { id: string; plate: string; name: string }) => normalized.includes(normalizeLookup(vehicle.name)));
  if (exactName) return exactName;

  return null;
}

export async function createContactAction(input: {
  name: string;
  role: string;
  document: string;
  phone: string;
  location: string;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();

  if (!input.name.trim()) {
    return { ok: false as const, error: "El nombre es obligatorio." };
  }
  if (!isValidDocument(input.document)) {
    return { ok: false as const, error: "El documento tiene un formato invalido." };
  }
  if (!isValidPhone(input.phone)) {
    return { ok: false as const, error: "El telefono tiene un formato invalido." };
  }

  const prisma = getPrismaClient();
  const roleMap = {
    "Cliente particular": "CLIENTE_PARTICULAR",
    "Clienta recurrente": "CLIENTE_RECURRENTE",
    "Tercero derivador": "TERCERO_DERIVADOR",
    Registro: "REGISTRO",
    Proveedor: "PROVEEDOR",
  } as const;

  const contact = await prisma.contact.create({
    data: {
      name: input.name.trim(),
      role: roleMap[input.role as keyof typeof roleMap] ?? "CLIENTE_PARTICULAR",
      document: input.document.trim() || null,
      phone: input.phone.trim() || null,
      location: input.location.trim() || null,
      status: "ACTIVO",
    },
  });

  revalidatePath("/contactos");

  return {
    ok: true as const,
    item: {
      id: contact.id,
      name: contact.name,
      role: input.role,
      document: contact.document ?? "Sin documentar",
      phone: contact.phone ?? "Sin telefono",
      location: contact.location ?? "Sin localidad",
      status: "Activo",
    },
  };
}

export async function updateContactAction(input: {
  id: string;
  name: string;
  role: string;
  document: string;
  phone: string;
  location: string;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();
  if (!input.name.trim()) {
    return { ok: false as const, error: "El nombre es obligatorio." };
  }
  if (!isValidDocument(input.document)) {
    return { ok: false as const, error: "El documento tiene un formato invalido." };
  }
  if (!isValidPhone(input.phone)) {
    return { ok: false as const, error: "El telefono tiene un formato invalido." };
  }

  const prisma = getPrismaClient();
  const roleMap = {
    "Cliente particular": "CLIENTE_PARTICULAR",
    "Clienta recurrente": "CLIENTE_RECURRENTE",
    "Tercero derivador": "TERCERO_DERIVADOR",
    Registro: "REGISTRO",
    Proveedor: "PROVEEDOR",
  } as const;

  const contact = await prisma.contact.update({
    where: { id: input.id },
    data: {
      name: input.name.trim(),
      role: roleMap[input.role as keyof typeof roleMap] ?? "CLIENTE_PARTICULAR",
      document: input.document.trim() || null,
      phone: input.phone.trim() || null,
      location: input.location.trim() || null,
    },
  });

  revalidatePath("/contactos");

  return {
    ok: true as const,
    item: {
      id: contact.id,
      name: contact.name,
      role: input.role,
      document: contact.document ?? "Sin documentar",
      phone: contact.phone ?? "Sin telefono",
      location: contact.location ?? "Sin localidad",
      status: "Activo",
    },
  };
}

export async function toggleContactArchivedAction(input: {
  id: string;
  archived: boolean;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();

  const prisma = getPrismaClient();
  const contact = await prisma.contact.update({
    where: { id: input.id },
    data: {
      archivedAt: input.archived ? null : new Date(),
      status: input.archived ? "ACTIVO" : "INACTIVO",
    },
  });

  revalidatePath("/contactos");

  return {
    ok: true as const,
    item: {
      id: contact.id,
      archived: Boolean(contact.archivedAt),
      status: contact.archivedAt ? "Archivado" : formatLabel(contact.status),
    },
  };
}

export async function createFinancialMovementAction(input: {
  description: string;
  category: string;
  area: string;
  account: string;
  amount: string;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();

  if (!input.description.trim()) {
    return { ok: false as const, error: "La descripcion es obligatoria." };
  }

  const prisma = getPrismaClient();
  const amount = input.amount.trim();
  if (!isSignedAmount(amount)) {
    return { ok: false as const, error: "El importe debe empezar con + o -." };
  }
  if (!isValidCurrencyInput(amount, { signed: true })) {
    return { ok: false as const, error: "El importe debe incluir un valor numerico." };
  }
  const type = amount.startsWith("-") ? "EGRESO" : "INGRESO";
  const areaMap = {
    Gestoria: "GESTORIA",
    Agencia: "AGENCIA",
    General: "GENERAL",
    Personal: "PERSONAL",
  } as const;
  const date = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());

  const movement = await prisma.financialMovement.create({
    data: {
      dateLabel: date,
      description: input.description.trim(),
      category: input.category.trim(),
      area: areaMap[input.area as keyof typeof areaMap] ?? "GESTORIA",
      account: input.account.trim() || "Caja gestoria",
      amount: amount || "+ $ 0",
      type,
    },
  });

  revalidatePath("/finanzas");

  return {
    ok: true as const,
    item: {
      id: movement.id,
      date: movement.dateLabel,
      description: movement.description,
      category: movement.category,
      area: input.area,
      account: movement.account,
      amount: movement.amount,
    },
  };
}

export async function updateFinancialMovementAction(input: {
  id: string;
  description: string;
  category: string;
  area: string;
  account: string;
  amount: string;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();
  if (!input.description.trim()) {
    return { ok: false as const, error: "La descripcion es obligatoria." };
  }

  const prisma = getPrismaClient();
  const amount = input.amount.trim() || "+ $ 0";
  if (!isSignedAmount(amount)) {
    return { ok: false as const, error: "El importe debe empezar con + o -." };
  }
  if (!isValidCurrencyInput(amount, { signed: true })) {
    return { ok: false as const, error: "El importe debe incluir un valor numerico." };
  }
  const type = amount.startsWith("-") ? "EGRESO" : "INGRESO";
  const areaMap = {
    Gestoria: "GESTORIA",
    Agencia: "AGENCIA",
    General: "GENERAL",
    Personal: "PERSONAL",
  } as const;

  const movement = await prisma.financialMovement.update({
    where: { id: input.id },
    data: {
      description: input.description.trim(),
      category: input.category.trim(),
      area: areaMap[input.area as keyof typeof areaMap] ?? "GESTORIA",
      account: input.account.trim() || "Caja gestoria",
      amount,
      type,
    },
  });

  revalidatePath("/finanzas");

  return {
    ok: true as const,
    item: {
      id: movement.id,
      date: movement.dateLabel,
      description: movement.description,
      category: movement.category,
      area: input.area,
      account: movement.account,
      amount: movement.amount,
    },
  };
}

export async function createTaskAction(input: {
  title: string;
  related: string;
  dueLabel: string;
  priority: string;
  assignee: string;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();

  if (!input.title.trim()) {
    return { ok: false as const, error: "El titulo es obligatorio." };
  }
  if (!input.assignee.trim()) {
    return { ok: false as const, error: "El responsable es obligatorio." };
  }

  const prisma = getPrismaClient();
  const priorityMap = {
    Urgente: "URGENTE",
    Alta: "ALTA",
    Media: "MEDIA",
  } as const;

  const task = await prisma.task.create({
    data: {
      title: input.title.trim(),
      related: input.related.trim() || "Tramite general",
      dueLabel: input.dueLabel.trim() || "Hoy - 18:00",
      priority: priorityMap[input.priority as keyof typeof priorityMap] ?? "MEDIA",
      assignee: input.assignee.trim() || "Sin asignar",
      done: false,
    },
  });

  revalidatePath("/tareas");

  return {
    ok: true as const,
    item: {
      id: task.id,
      title: task.title,
      related: task.related,
      dueLabel: task.dueLabel,
      priority: input.priority,
      assignee: task.assignee,
      tone:
        input.priority === "Urgente"
          ? ("danger" as const)
          : input.priority === "Alta"
            ? ("warning" as const)
            : ("info" as const),
      done: task.done,
    },
  };
}

export async function toggleTaskDoneAction(id: string) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();

  const prisma = getPrismaClient();
  const current = await prisma.task.findUnique({ where: { id } });

  if (!current) {
    return { ok: false as const, error: "La tarea no existe." };
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { done: !current.done },
  });

  revalidatePath("/tareas");

  return {
    ok: true as const,
    item: {
      id: updated.id,
      done: updated.done,
    },
  };
}

export async function updateTaskAction(input: {
  id: string;
  title: string;
  related: string;
  dueLabel: string;
  priority: string;
  assignee: string;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();
  if (!input.title.trim()) {
    return { ok: false as const, error: "El titulo es obligatorio." };
  }
  if (!input.assignee.trim()) {
    return { ok: false as const, error: "El responsable es obligatorio." };
  }

  const prisma = getPrismaClient();
  const priorityMap = {
    Urgente: "URGENTE",
    Alta: "ALTA",
    Media: "MEDIA",
  } as const;

  const task = await prisma.task.update({
    where: { id: input.id },
    data: {
      title: input.title.trim(),
      related: input.related.trim() || "Tramite general",
      dueLabel: input.dueLabel.trim() || "Hoy - 18:00",
      priority: priorityMap[input.priority as keyof typeof priorityMap] ?? "MEDIA",
      assignee: input.assignee.trim() || "Sin asignar",
    },
  });

  revalidatePath("/tareas");

  return {
    ok: true as const,
    item: {
      id: task.id,
      title: task.title,
      related: task.related,
      dueLabel: task.dueLabel,
      priority: input.priority,
      assignee: task.assignee,
      tone:
        input.priority === "Urgente"
          ? ("danger" as const)
          : input.priority === "Alta"
            ? ("warning" as const)
            : ("info" as const),
      done: task.done,
    },
  };
}

export async function toggleTaskArchivedAction(input: {
  id: string;
  archived: boolean;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();

  const prisma = getPrismaClient();
  const task = await prisma.task.update({
    where: { id: input.id },
    data: {
      archivedAt: input.archived ? null : new Date(),
    },
  });

  revalidatePath("/tareas");

  return {
    ok: true as const,
    item: {
      id: task.id,
      archived: Boolean(task.archivedAt),
    },
  };
}

export async function createGuideAction(input: {
  title: string;
  summary: string;
  scope: string;
  jurisdiction: string;
  highlights: string[];
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();
  if (!input.title.trim() || !input.summary.trim()) {
    return { ok: false as const, error: "Titulo y resumen son obligatorios." };
  }

  const prisma = getPrismaClient();
  const lastUpdate = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());

  const guide = await prisma.guide.create({
    data: {
      title: input.title.trim(),
      summary: input.summary.trim(),
      scope: input.scope.trim() || "Base",
      jurisdiction: input.jurisdiction.trim() || "Nacional",
      lastUpdate: `Actualizada ${lastUpdate}`,
      highlights: input.highlights.filter(Boolean),
    },
  });

  revalidatePath("/ayudas");

  return {
    ok: true as const,
    item: {
      id: guide.id,
      title: guide.title,
      summary: guide.summary,
      scope: guide.scope,
      jurisdiction: guide.jurisdiction,
      lastUpdate: guide.lastUpdate,
      highlights: guide.highlights,
      archived: false,
    },
  };
}

export async function updateGuideAction(input: {
  id: string;
  title: string;
  summary: string;
  scope: string;
  jurisdiction: string;
  highlights: string[];
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();
  if (!input.title.trim() || !input.summary.trim()) {
    return { ok: false as const, error: "Titulo y resumen son obligatorios." };
  }

  const prisma = getPrismaClient();
  const lastUpdate = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());

  const guide = await prisma.guide.update({
    where: { id: input.id },
    data: {
      title: input.title.trim(),
      summary: input.summary.trim(),
      scope: input.scope.trim() || "Base",
      jurisdiction: input.jurisdiction.trim() || "Nacional",
      lastUpdate: `Actualizada ${lastUpdate}`,
      highlights: input.highlights.filter(Boolean),
    },
  });

  revalidatePath("/ayudas");

  return {
    ok: true as const,
    item: {
      id: guide.id,
      title: guide.title,
      summary: guide.summary,
      scope: guide.scope,
      jurisdiction: guide.jurisdiction,
      lastUpdate: guide.lastUpdate,
      highlights: guide.highlights,
      archived: Boolean(guide.archivedAt),
    },
  };
}

export async function toggleGuideArchivedAction(input: {
  id: string;
  archived: boolean;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();

  const prisma = getPrismaClient();
  const guide = await prisma.guide.update({
    where: { id: input.id },
    data: {
      archivedAt: input.archived ? null : new Date(),
    },
  });

  revalidatePath("/ayudas");

  return {
    ok: true as const,
    item: {
      id: guide.id,
      archived: Boolean(guide.archivedAt),
    },
  };
}

export async function createProcedureAction(input: {
  type: string;
  client: string;
  vehicle: string;
  jurisdiction: string;
  priority: string;
  targetDate: string;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();

  if (!input.client.trim() || !input.vehicle.trim()) {
    return { ok: false as const, error: "Cliente y vehiculo son obligatorios." };
  }
  if (!input.type.trim()) {
    return { ok: false as const, error: "El tipo de tramite es obligatorio." };
  }
  if (!isValidDateLabel(input.targetDate)) {
    return { ok: false as const, error: "La fecha objetivo debe tener formato DD/MM/AAAA." };
  }

  const prisma = getPrismaClient();
  const priorityMap = {
    Urgente: "URGENTE",
    Alta: "ALTA",
    Media: "MEDIA",
  } as const;

  const baseSlug = `${input.type}-${input.client}-${Date.now()}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const [contactId, vehicle] = await Promise.all([
    resolveContactIdByName(input.client),
    resolveVehicleByLabel(input.vehicle),
  ]);

  const procedure = await prisma.procedure.create({
    data: {
      slug: baseSlug,
      type: input.type.trim(),
      clientName: input.client.trim(),
      vehicleLabel: input.vehicle.trim(),
      contactId,
      vehicleId: vehicle?.id ?? null,
      status: "BORRADOR",
      priority: priorityMap[input.priority as keyof typeof priorityMap] ?? "MEDIA",
      jurisdiction: input.jurisdiction.trim() || "La Pampa",
      targetDate: input.targetDate.trim() || "Sin fecha",
      guideTitle: `Guia base de ${input.type.trim().toLowerCase()}`,
      guideSummary: "Tramite inicial cargado desde la vista principal. Completar seguimiento y checklist.",
      notes: {
        create: [{ body: "Tramite creado desde alta rapida." }],
      },
      timeline: {
        create: [
          {
            title: "Alta inicial",
            description: "Se genero el tramite desde la grilla principal.",
            dateLabel: new Intl.DateTimeFormat("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/Argentina/Buenos_Aires",
            }).format(new Date()),
          },
        ],
      },
    },
  });

  revalidatePath("/tramites");
  revalidatePath(`/tramites/${procedure.slug}`);

  return {
    ok: true as const,
    item: {
      id: procedure.slug,
      type: procedure.type,
      client: procedure.clientName,
      vehicle: procedure.vehicleLabel,
      status: "Borrador",
      statusTone: "neutral" as const,
      priority: input.priority,
      jurisdiction: procedure.jurisdiction,
      targetDate: procedure.targetDate,
    },
  };
}

export async function updateProcedureStatusAction(input: {
  id: string;
  status: string;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();

  const statusMap = {
    "Pendiente de documentacion": "PENDIENTE_DOCUMENTACION",
    "Listo para presentar": "LISTO_PARA_PRESENTAR",
    Presentado: "PRESENTADO",
    Observado: "OBSERVADO",
    Terminado: "TERMINADO",
    Borrador: "BORRADOR",
  } as const;

  const prisma = getPrismaClient();
  const current = await prisma.procedure.findUnique({
    where: { slug: input.id },
    select: {
      id: true,
      status: true,
      type: true,
      clientName: true,
    },
  });

  if (!current) {
    return { ok: false as const, error: "No se encontro el tramite." };
  }

  const nextStatus = statusMap[input.status as keyof typeof statusMap] ?? "BORRADOR";

  const timelineItem = {
    title: "Cambio de estado",
    description: `Paso de ${formatLabel(current.status)} a ${formatLabel(nextStatus)} en ${current.type} de ${current.clientName}.`,
    date: getBuenosAiresDateTimeLabel(),
  };

  await prisma.procedure.update({
    where: { slug: input.id },
    data: {
      status: nextStatus,
      timeline: {
        create: {
          title: timelineItem.title,
          description: timelineItem.description,
          dateLabel: timelineItem.date,
        },
      },
    },
  });

  revalidatePath("/tramites");
  revalidatePath(`/tramites/${input.id}`);

  return { ok: true as const, item: timelineItem };
}

export async function addProcedureNoteAction(input: {
  id: string;
  note: string;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();
  if (!input.note.trim()) {
    return { ok: false as const, error: "La nota no puede estar vacia." };
  }

  const prisma = getPrismaClient();
  const procedure = await prisma.procedure.findUnique({
    where: { slug: input.id },
    select: { id: true },
  });

  if (!procedure) {
    return { ok: false as const, error: "No se encontro el tramite." };
  }

  const timelineItem = {
    title: "Nota operativa",
    description: input.note.trim(),
    date: getBuenosAiresDateTimeLabel(),
  };

  await prisma.procedure.update({
    where: { id: procedure.id },
    data: {
      notes: {
        create: {
          body: input.note.trim(),
        },
      },
      timeline: {
        create: {
          title: timelineItem.title,
          description: timelineItem.description,
          dateLabel: timelineItem.date,
        },
      },
    },
  });

  revalidatePath(`/tramites/${input.id}`);
  return { ok: true as const, item: input.note.trim(), timelineItem };
}

export async function toggleProcedureRequirementAction(input: {
  id: string;
  label: string;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();

  const prisma = getPrismaClient();
  const procedure = await prisma.procedure.findUnique({
    where: { slug: input.id },
    select: {
      id: true,
      requirements: {
        where: { label: input.label },
        select: { id: true, done: true },
        take: 1,
      },
    },
  });

  const requirement = procedure?.requirements[0];
  if (!procedure || !requirement) {
    return { ok: false as const, error: "No se encontro el requisito." };
  }

  const updated = await prisma.procedureRequirement.update({
    where: { id: requirement.id },
    data: { done: !requirement.done },
  });

  const timelineItem = {
    title: updated.done ? "Requisito recibido" : "Requisito reabierto",
    description: `${input.label}: ${updated.done ? "marcado como recibido" : "vuelve a pendiente"}.`,
    date: getBuenosAiresDateTimeLabel(),
  };

  await prisma.procedureTimeline.create({
    data: {
      procedureId: procedure.id,
      title: timelineItem.title,
      description: timelineItem.description,
      dateLabel: timelineItem.date,
    },
  });

  revalidatePath(`/tramites/${input.id}`);
  return {
    ok: true as const,
    item: {
      label: input.label,
      done: updated.done,
      timelineItem,
    },
  };
}

export async function addProcedureMovementAction(input: {
  id: string;
  label: string;
  meta: string;
  amount: string;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();
  if (!input.label.trim()) {
    return { ok: false as const, error: "El concepto es obligatorio." };
  }

  const prisma = getPrismaClient();
  const procedure = await prisma.procedure.findUnique({
    where: { slug: input.id },
    select: { id: true },
  });

  if (!procedure) {
    return { ok: false as const, error: "No se encontro el tramite." };
  }

  const amount = input.amount.trim() || "- $ 0";
  if (!isSignedAmount(amount) || !isValidCurrencyInput(amount, { signed: true })) {
    return { ok: false as const, error: "El importe debe empezar con + o - y tener valor numerico." };
  }
  const meta = input.meta.trim() || "Gasto manual - Caja gestoria";
  const type = amount.startsWith("+") ? "INGRESO" : "EGRESO";
  const area = /agencia/i.test(meta) ? "AGENCIA" : /personal/i.test(meta) ? "PERSONAL" : /general/i.test(meta) ? "GENERAL" : "GESTORIA";

  const movement = await prisma.procedureMovement.create({
    data: {
      procedureId: procedure.id,
      label: input.label.trim(),
      meta,
      amount,
      type,
      area,
    },
  });

  const timelineItem = {
    title: type === "INGRESO" ? "Ingreso vinculado" : "Egreso vinculado",
    description: `${movement.label} por ${movement.amount} en ${movement.meta}.`,
    date: getBuenosAiresDateTimeLabel(),
  };

  await prisma.procedureTimeline.create({
    data: {
      procedureId: procedure.id,
      title: timelineItem.title,
      description: timelineItem.description,
      dateLabel: timelineItem.date,
    },
  });

  revalidatePath(`/tramites/${input.id}`);
  return {
    ok: true as const,
    item: {
      label: movement.label,
      meta: movement.meta,
      amount: movement.amount,
      timelineItem,
    },
  };
}

export async function createOperationAction(input: {
  type: string;
  vehicle: string;
  buyer: string;
  seller: string;
  date: string;
  agreedPrice: string;
  realCost: string;
  commission: string;
  margin: string;
  note: string;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();
  if (!input.vehicle.trim()) {
    return { ok: false as const, error: "El vehiculo es obligatorio." };
  }
  if (!isValidDateLabel(input.date)) {
    return { ok: false as const, error: "La fecha debe tener formato DD/MM/AAAA." };
  }
  if (!isValidCurrencyInput(input.agreedPrice)) {
    return { ok: false as const, error: "El precio pactado debe incluir un valor numerico." };
  }
  if (!isValidCurrencyInput(input.realCost)) {
    return { ok: false as const, error: "El costo real debe incluir un valor numerico." };
  }
  if (!isValidCurrencyInput(input.margin)) {
    return { ok: false as const, error: "El margen debe incluir un valor numerico." };
  }
  if (input.commission.trim() && !isValidCurrencyInput(input.commission)) {
    return { ok: false as const, error: "La comision debe incluir un valor numerico." };
  }
  if (input.type === "Venta" && !input.buyer.trim()) {
    return { ok: false as const, error: "La venta necesita comprador." };
  }
  if (input.type === "Compra" && !input.seller.trim()) {
    return { ok: false as const, error: "La compra necesita vendedor." };
  }
  if (input.type === "Reserva" && !input.buyer.trim()) {
    return { ok: false as const, error: "La reserva necesita comprador." };
  }

  const prisma = getPrismaClient();
  const typeMap = {
    Compra: "COMPRA",
    Venta: "VENTA",
    Consignacion: "CONSIGNACION",
    Reserva: "RESERVA",
    Permuta: "PERMUTA",
  } as const;

  const status = input.type === "Reserva" ? "RESERVADA" : "ABIERTA";

  const operation = await prisma.operation.create({
    data: {
      vehicleId: (await resolveVehicleByLabel(input.vehicle))?.id ?? null,
      buyerId: input.buyer.trim() ? await resolveContactIdByName(input.buyer) : null,
      sellerId: input.seller.trim() ? await resolveContactIdByName(input.seller) : null,
      type: typeMap[input.type as keyof typeof typeMap] ?? "VENTA",
      vehicleLabel: input.vehicle.trim(),
      buyerName: input.buyer.trim() || null,
      sellerName: input.seller.trim() || null,
      dateLabel: input.date.trim() || "Sin fecha",
      agreedPrice: input.agreedPrice.trim() || "$ 0",
      realCost: input.realCost.trim() || "$ 0",
      commission: input.commission.trim() || "$ 0",
      margin: input.margin.trim() || "$ 0",
      status,
      notes: input.note.trim() || null,
    },
  });

  revalidatePath("/operaciones");

  return {
    ok: true as const,
    item: {
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
      status: operation.status === "RESERVADA" ? "Reservada" : "Abierta",
      tone: operation.status === "RESERVADA" ? ("warning" as const) : ("info" as const),
      note: operation.notes ?? "Sin observaciones",
    },
  };
}

export async function updateOperationAction(input: {
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
  note: string;
  status: string;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();
  if (!input.vehicle.trim()) {
    return { ok: false as const, error: "El vehiculo es obligatorio." };
  }
  if (!isValidDateLabel(input.date)) {
    return { ok: false as const, error: "La fecha debe tener formato DD/MM/AAAA." };
  }
  if (!isValidCurrencyInput(input.agreedPrice)) {
    return { ok: false as const, error: "El precio pactado debe incluir un valor numerico." };
  }
  if (!isValidCurrencyInput(input.realCost)) {
    return { ok: false as const, error: "El costo real debe incluir un valor numerico." };
  }
  if (!isValidCurrencyInput(input.margin)) {
    return { ok: false as const, error: "El margen debe incluir un valor numerico." };
  }
  if (input.commission.trim() && !isValidCurrencyInput(input.commission)) {
    return { ok: false as const, error: "La comision debe incluir un valor numerico." };
  }
  if (input.type === "Venta" && !input.buyer.trim()) {
    return { ok: false as const, error: "La venta necesita comprador." };
  }
  if (input.type === "Compra" && !input.seller.trim()) {
    return { ok: false as const, error: "La compra necesita vendedor." };
  }
  if (input.type === "Reserva" && !input.buyer.trim()) {
    return { ok: false as const, error: "La reserva necesita comprador." };
  }

  const prisma = getPrismaClient();
  const typeMap = {
    Compra: "COMPRA",
    Venta: "VENTA",
    Consignacion: "CONSIGNACION",
    Reserva: "RESERVA",
    Permuta: "PERMUTA",
  } as const;
  const statusMap = {
    Abierta: "ABIERTA",
    Reservada: "RESERVADA",
    Cerrada: "CERRADA",
    Anulada: "ANULADA",
  } as const;

  const operation = await prisma.operation.update({
    where: { id: input.id },
    data: {
      vehicleId: (await resolveVehicleByLabel(input.vehicle))?.id ?? null,
      buyerId: input.buyer.trim() ? await resolveContactIdByName(input.buyer) : null,
      sellerId: input.seller.trim() ? await resolveContactIdByName(input.seller) : null,
      type: typeMap[input.type as keyof typeof typeMap] ?? "VENTA",
      vehicleLabel: input.vehicle.trim(),
      buyerName: input.buyer.trim() || null,
      sellerName: input.seller.trim() || null,
      dateLabel: input.date.trim() || "Sin fecha",
      agreedPrice: input.agreedPrice.trim() || "$ 0",
      realCost: input.realCost.trim() || "$ 0",
      commission: input.commission.trim() || "$ 0",
      margin: input.margin.trim() || "$ 0",
      status: statusMap[input.status as keyof typeof statusMap] ?? "ABIERTA",
      notes: input.note.trim() || null,
    },
  });

  revalidatePath("/operaciones");

  return {
    ok: true as const,
    item: {
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
      status: formatLabel(operation.status),
      tone:
        operation.status === "CERRADA"
          ? ("success" as const)
          : operation.status === "RESERVADA"
            ? ("warning" as const)
            : operation.status === "ANULADA"
              ? ("danger" as const)
              : ("info" as const),
      note: operation.notes ?? "Sin observaciones",
    },
  };
}

export async function createVehicleAction(input: {
  plate: string;
  name: string;
  owner: string;
  area: string;
  status: string;
  note: string;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();
  if (!input.plate.trim() || !input.name.trim()) {
    return { ok: false as const, error: "Dominio y nombre son obligatorios." };
  }
  if (!isValidPlate(input.plate)) {
    return { ok: false as const, error: "El dominio debe tener entre 6 y 8 caracteres validos." };
  }

  const prisma = getPrismaClient();
  const areaMap = {
    Gestoria: "GESTORIA",
    Agencia: "AGENCIA",
  } as const;
  const statusMap = {
    "En tramite": "EN_TRAMITE",
    "En stock": "EN_STOCK",
    "Documentacion incompleta": "DOCUMENTACION_INCOMPLETA",
  } as const;

  const vehicle = await prisma.vehicle.create({
    data: {
      plate: normalizePlate(input.plate),
      name: input.name.trim(),
      owner: input.owner.trim() || "Sin titular",
      area: areaMap[input.area as keyof typeof areaMap] ?? "GESTORIA",
      status: statusMap[input.status as keyof typeof statusMap] ?? "EN_TRAMITE",
      note: input.note.trim() || "Sin observaciones",
    },
  });

  revalidatePath("/vehiculos");

  return {
    ok: true as const,
    item: {
      id: vehicle.id,
      plate: vehicle.plate,
      name: vehicle.name,
      owner: vehicle.owner,
      area: input.area,
      status: input.status,
      tone:
        input.status === "En stock"
          ? ("info" as const)
          : input.status === "Documentacion incompleta"
            ? ("danger" as const)
            : ("warning" as const),
      note: vehicle.note,
    },
  };
}

export async function updateVehicleAction(input: {
  id: string;
  plate: string;
  name: string;
  owner: string;
  area: string;
  status: string;
  note: string;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();
  if (!input.plate.trim() || !input.name.trim()) {
    return { ok: false as const, error: "Dominio y nombre son obligatorios." };
  }
  if (!isValidPlate(input.plate)) {
    return { ok: false as const, error: "El dominio debe tener entre 6 y 8 caracteres validos." };
  }

  const prisma = getPrismaClient();
  const areaMap = {
    Gestoria: "GESTORIA",
    Agencia: "AGENCIA",
  } as const;
  const statusMap = {
    "En tramite": "EN_TRAMITE",
    "En stock": "EN_STOCK",
    "Documentacion incompleta": "DOCUMENTACION_INCOMPLETA",
  } as const;

  const vehicle = await prisma.vehicle.update({
    where: { id: input.id },
    data: {
      plate: normalizePlate(input.plate),
      name: input.name.trim(),
      owner: input.owner.trim() || "Sin titular",
      area: areaMap[input.area as keyof typeof areaMap] ?? "GESTORIA",
      status: statusMap[input.status as keyof typeof statusMap] ?? "EN_TRAMITE",
      note: input.note.trim() || "Sin observaciones",
    },
  });

  revalidatePath("/vehiculos");

  return {
    ok: true as const,
    item: {
      id: vehicle.id,
      plate: vehicle.plate,
      name: vehicle.name,
      owner: vehicle.owner,
      area: input.area,
      status: input.status,
      tone:
        input.status === "En stock"
          ? ("info" as const)
          : input.status === "Documentacion incompleta"
            ? ("danger" as const)
            : ("warning" as const),
      note: vehicle.note,
    },
  };
}

export async function toggleVehicleArchivedAction(input: {
  id: string;
  archived: boolean;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  if (!canEditRole(profile.role)) return forbiddenResult();

  const prisma = getPrismaClient();
  const vehicle = await prisma.vehicle.update({
    where: { id: input.id },
    data: {
      archivedAt: input.archived ? null : new Date(),
    },
  });

  revalidatePath("/vehiculos");

  return {
    ok: true as const,
    item: {
      id: vehicle.id,
      archived: Boolean(vehicle.archivedAt),
    },
  };
}
