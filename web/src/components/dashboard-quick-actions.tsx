"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createContactAction,
  createFinancialMovementAction,
  createProcedureAction,
  createTaskAction,
} from "@/app/(app)/actions";
import { getProcedureTemplate, listProcedureTemplates } from "@/lib/procedure-templates";

const quickActions = [
  { id: "tramite", label: "Nuevo tramite" },
  { id: "tarea", label: "Crear tarea" },
  { id: "contacto", label: "Agregar cliente" },
  { id: "movimiento", label: "Cargar movimiento" },
] as const;
const procedureTemplates = listProcedureTemplates();

export function DashboardQuickActions({ canEdit }: { canEdit: boolean }) {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<(typeof quickActions)[number]["id"]>("tramite");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const [procedureDraft, setProcedureDraft] = useState({
    type: "Transferencia",
    client: "",
    vehicle: "",
    jurisdiction: "La Pampa",
    priority: "Media",
    targetDate: "",
  });
  const [taskDraft, setTaskDraft] = useState({
    title: "",
    related: "Tramite general",
    dueLabel: "Hoy - 18:00",
    priority: "Media",
    assignee: "Marcelo",
  });
  const [contactDraft, setContactDraft] = useState({
    name: "",
    role: "Cliente particular",
    document: "",
    phone: "",
    location: "Santa Rosa, La Pampa",
  });
  const [movementDraft, setMovementDraft] = useState({
    description: "",
    category: "Honorarios",
    area: "Gestoria",
    account: "Caja gestoria",
    amount: "+ $ 0",
  });

  function handleSuccess(message: string) {
    setError("");
    setSuccess(message);
    router.refresh();
  }

  function submitProcedure() {
    if (!canEdit) return;
    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await createProcedureAction(procedureDraft);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setProcedureDraft({
        type: "Transferencia",
        client: "",
        vehicle: "",
        jurisdiction: "La Pampa",
        priority: "Media",
        targetDate: "",
      });
      handleSuccess("Tramite creado.");
    });
  }

  function applyProcedureTemplate(type: string) {
    const template = getProcedureTemplate(type);
    setProcedureDraft((current) => ({
      ...current,
      type: template.type,
      jurisdiction: template.defaultJurisdiction,
      priority: template.defaultPriority,
    }));
  }

  function submitTask() {
    if (!canEdit) return;
    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await createTaskAction(taskDraft);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTaskDraft({
        title: "",
        related: "Tramite general",
        dueLabel: "Hoy - 18:00",
        priority: "Media",
        assignee: "Marcelo",
      });
      handleSuccess("Tarea creada.");
    });
  }

  function submitContact() {
    if (!canEdit) return;
    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await createContactAction(contactDraft);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setContactDraft({
        name: "",
        role: "Cliente particular",
        document: "",
        phone: "",
        location: "Santa Rosa, La Pampa",
      });
      handleSuccess("Contacto creado.");
    });
  }

  function submitMovement() {
    if (!canEdit) return;
    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await createFinancialMovementAction(movementDraft);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMovementDraft({
        description: "",
        category: "Honorarios",
        area: "Gestoria",
        account: "Caja gestoria",
        amount: "+ $ 0",
      });
      handleSuccess("Movimiento cargado.");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => setActiveAction(action.id)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              activeAction === action.id
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            }`}
            disabled={!canEdit || isPending}
          >
            {action.label}
          </button>
        ))}
      </div>

      {activeAction === "tramite" ? (
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            {procedureTemplates.map((template) => (
              <button
                key={template.type}
                type="button"
                onClick={() => applyProcedureTemplate(template.type)}
                className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.14em] transition ${
                  procedureDraft.type === template.type
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                }`}
                disabled={!canEdit || isPending}
              >
                {template.type}
              </button>
            ))}
          </div>
          <select value={procedureDraft.type} onChange={(event) => setProcedureDraft((current) => ({ ...current, type: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" disabled={!canEdit || isPending}>
            {procedureTemplates.map((template) => (
              <option key={template.type}>{template.type}</option>
            ))}
          </select>
          <input value={procedureDraft.client} onChange={(event) => setProcedureDraft((current) => ({ ...current, client: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Cliente" disabled={!canEdit || isPending} />
          <input value={procedureDraft.vehicle} onChange={(event) => setProcedureDraft((current) => ({ ...current, vehicle: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Vehiculo" disabled={!canEdit || isPending} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={procedureDraft.jurisdiction} onChange={(event) => setProcedureDraft((current) => ({ ...current, jurisdiction: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Jurisdiccion" disabled={!canEdit || isPending} />
            <select value={procedureDraft.priority} onChange={(event) => setProcedureDraft((current) => ({ ...current, priority: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" disabled={!canEdit || isPending}>
              <option>Urgente</option>
              <option>Alta</option>
              <option>Media</option>
            </select>
          </div>
          <input value={procedureDraft.targetDate} onChange={(event) => setProcedureDraft((current) => ({ ...current, targetDate: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Fecha objetivo" disabled={!canEdit || isPending} />
          <button onClick={submitProcedure} disabled={!canEdit || isPending} className="h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:opacity-45">
            {isPending ? "Guardando..." : "Crear tramite"}
          </button>
        </div>
      ) : null}

      {activeAction === "tarea" ? (
        <div className="grid gap-3">
          <input value={taskDraft.title} onChange={(event) => setTaskDraft((current) => ({ ...current, title: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Titulo" disabled={!canEdit || isPending} />
          <input value={taskDraft.related} onChange={(event) => setTaskDraft((current) => ({ ...current, related: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Relacionado con" disabled={!canEdit || isPending} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={taskDraft.dueLabel} onChange={(event) => setTaskDraft((current) => ({ ...current, dueLabel: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Vence" disabled={!canEdit || isPending} />
            <select value={taskDraft.priority} onChange={(event) => setTaskDraft((current) => ({ ...current, priority: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" disabled={!canEdit || isPending}>
              <option>Urgente</option>
              <option>Alta</option>
              <option>Media</option>
            </select>
          </div>
          <input value={taskDraft.assignee} onChange={(event) => setTaskDraft((current) => ({ ...current, assignee: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Responsable" disabled={!canEdit || isPending} />
          <button onClick={submitTask} disabled={!canEdit || isPending} className="h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:opacity-45">
            {isPending ? "Guardando..." : "Crear tarea"}
          </button>
        </div>
      ) : null}

      {activeAction === "contacto" ? (
        <div className="grid gap-3">
          <input value={contactDraft.name} onChange={(event) => setContactDraft((current) => ({ ...current, name: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Nombre" disabled={!canEdit || isPending} />
          <select value={contactDraft.role} onChange={(event) => setContactDraft((current) => ({ ...current, role: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" disabled={!canEdit || isPending}>
            <option>Cliente particular</option>
            <option>Clienta recurrente</option>
            <option>Tercero derivador</option>
            <option>Registro</option>
            <option>Proveedor</option>
          </select>
          <input value={contactDraft.document} onChange={(event) => setContactDraft((current) => ({ ...current, document: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="DNI / CUIT" disabled={!canEdit || isPending} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={contactDraft.phone} onChange={(event) => setContactDraft((current) => ({ ...current, phone: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Telefono" disabled={!canEdit || isPending} />
            <input value={contactDraft.location} onChange={(event) => setContactDraft((current) => ({ ...current, location: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Localidad" disabled={!canEdit || isPending} />
          </div>
          <button onClick={submitContact} disabled={!canEdit || isPending} className="h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:opacity-45">
            {isPending ? "Guardando..." : "Agregar contacto"}
          </button>
        </div>
      ) : null}

      {activeAction === "movimiento" ? (
        <div className="grid gap-3">
          <input value={movementDraft.description} onChange={(event) => setMovementDraft((current) => ({ ...current, description: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Descripcion" disabled={!canEdit || isPending} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={movementDraft.category} onChange={(event) => setMovementDraft((current) => ({ ...current, category: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Categoria" disabled={!canEdit || isPending} />
            <select value={movementDraft.area} onChange={(event) => setMovementDraft((current) => ({ ...current, area: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" disabled={!canEdit || isPending}>
              <option>Gestoria</option>
              <option>Agencia</option>
              <option>General</option>
              <option>Personal</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={movementDraft.account} onChange={(event) => setMovementDraft((current) => ({ ...current, account: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Cuenta" disabled={!canEdit || isPending} />
            <input value={movementDraft.amount} onChange={(event) => setMovementDraft((current) => ({ ...current, amount: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="+ $ 0 o - $ 0" disabled={!canEdit || isPending} />
          </div>
          <button onClick={submitMovement} disabled={!canEdit || isPending} className="h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:opacity-45">
            {isPending ? "Guardando..." : "Cargar movimiento"}
          </button>
        </div>
      ) : null}

      {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}
      {success ? <p className="text-sm text-[var(--color-success)]">{success}</p> : null}
      {!canEdit ? <p className="text-sm text-[var(--color-muted)]">Tu rol solo puede consultar.</p> : null}
    </div>
  );
}
