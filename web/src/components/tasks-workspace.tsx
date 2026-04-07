"use client";

import { useMemo, useState, useTransition } from "react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { tasks as mockTasks } from "@/data/mock-data";
import { confirmDiscardChanges, useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import {
  createTaskAction,
  toggleTaskArchivedAction,
  toggleTaskDoneAction,
  updateTaskAction,
} from "@/app/(app)/actions";

type TaskItem = {
  id: string;
  title: string;
  related: string;
  dueLabel: string;
  priority: string;
  assignee: string;
  tone: "success" | "warning" | "danger" | "neutral" | "info";
  done?: boolean;
  archived?: boolean;
};

const filters = ["Todas", "Urgente", "Alta", "Media", "Completadas", "Archivadas"] as const;

export function TasksWorkspace({
  initialItems = mockTasks,
  canEdit,
}: {
  initialItems?: TaskItem[];
  canEdit: boolean;
}) {
  const [items, setItems] = useState<TaskItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Todas");
  const [showComposer, setShowComposer] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    related: "Tramite general",
    dueLabel: "Hoy - 18:00",
    priority: "Media",
    assignee: "Marcelo",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState({
    title: "",
    related: "",
    dueLabel: "",
    priority: "Media",
    assignee: "",
  });
  const [editingInitial, setEditingInitial] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      items.filter((task) => {
        const matchesSearch =
          !search ||
          `${task.title} ${task.related} ${task.assignee}`.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
          activeFilter === "Todas"
            ? !task.archived
            : activeFilter === "Completadas"
              ? !task.archived && Boolean(task.done)
              : activeFilter === "Archivadas"
                ? Boolean(task.archived)
                : !task.archived && task.priority === activeFilter;
        return matchesSearch && matchesFilter;
      }),
    [activeFilter, items, search],
  );
  const hasDraftChanges = Boolean(
    draft.title.trim() ||
      draft.related !== "Tramite general" ||
      draft.dueLabel !== "Hoy - 18:00" ||
      draft.priority !== "Media" ||
      draft.assignee !== "Marcelo",
  );
  const hasEditChanges =
    editingId !== null &&
    JSON.stringify(editingDraft) !== editingInitial;

  useUnsavedChanges((showComposer && hasDraftChanges) || hasEditChanges);

  function toneFromPriority(priority: string, done?: boolean) {
    if (done) return "success" as const;
    if (priority === "Urgente") return "danger" as const;
    if (priority === "Alta") return "warning" as const;
    return "info" as const;
  }

  function toggleDone(id: string) {
    if (!canEdit) return;

    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await toggleTaskDoneAction(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) =>
        current.map((task) =>
          task.id === id
            ? { ...task, done: result.item.done, tone: toneFromPriority(task.priority, result.item.done) }
            : task,
        ),
      );
      setSuccess(result.item.done ? "Tarea completada." : "Tarea reabierta.");
    });
  }

  function addTask() {
    if (!canEdit || !draft.title.trim()) return;

    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await createTaskAction(draft);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) => [result.item, ...current]);
      setDraft({
        title: "",
        related: "Tramite general",
        dueLabel: "Hoy - 18:00",
        priority: "Media",
        assignee: "Marcelo",
      });
      setShowComposer(false);
      setSuccess("Tarea creada.");
    });
  }

  function toggleArchived(task: TaskItem) {
    if (!canEdit) return;

    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await toggleTaskArchivedAction({
        id: task.id,
        archived: Boolean(task.archived),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === task.id ? { ...item, archived: result.item.archived } : item,
        ),
      );
      setEditingId(null);
      setSuccess(task.archived ? "Tarea reactivada." : "Tarea archivada.");
    });
  }

  function startEditing(task: TaskItem) {
    setError("");
    setSuccess("");
    setEditingId(task.id);
    const nextDraft = {
      title: task.title,
      related: task.related,
      dueLabel: task.dueLabel,
      priority: task.priority,
      assignee: task.assignee,
    };
    setEditingDraft(nextDraft);
    setEditingInitial(JSON.stringify(nextDraft));
  }

  function saveEdit() {
    if (!canEdit || !editingId) return;

    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await updateTaskAction({
        id: editingId,
        ...editingDraft,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) =>
        current.map((task) =>
          task.id === editingId
            ? { ...result.item, tone: toneFromPriority(result.item.priority, result.item.done) }
            : task,
        ),
      );
      setEditingId(null);
      setEditingInitial("");
      setSuccess("Tarea actualizada.");
    });
  }

  function resetDraft() {
    if (!confirmDiscardChanges(hasDraftChanges)) return;
    setDraft({
      title: "",
      related: "Tramite general",
      dueLabel: "Hoy - 18:00",
      priority: "Media",
      assignee: "Marcelo",
    });
    setError("");
    setSuccess("");
  }

  function cancelEdit() {
    if (!confirmDiscardChanges(hasEditChanges)) return;
    setEditingId(null);
    setEditingInitial("");
    setError("");
    setSuccess("");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Agenda"
        title="Tareas"
        description="Seguimiento corto del dia, tareas vencidas y proximos movimientos."
        actionLabel="Nueva tarea"
        actionDisabled={!canEdit}
      />

      <section className="grid gap-4 rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por tarea, responsable o entidad relacionada" className="h-12 w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" />
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button key={filter} onClick={() => setActiveFilter(filter)} className={`rounded-full border px-4 py-2 text-sm transition ${activeFilter === filter ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white" : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"}`}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Pendientes</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{items.filter((task) => !task.done && !task.archived).length}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Urgentes</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{items.filter((task) => task.priority === "Urgente" && !task.done && !task.archived).length}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Completadas</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{items.filter((task) => task.done && !task.archived).length}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Archivadas</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{items.filter((task) => task.archived).length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Alta rapida de tarea</p>
            {showComposer ? <p className="mt-1 text-sm text-[var(--color-warning,#b57628)]">{hasDraftChanges ? "Tenes cambios sin guardar en el alta." : "Abri el alta solo cuando necesites cargar una tarea nueva."}</p> : null}
          </div>
          <div className="flex items-center gap-3">
            {!canEdit ? <p className="text-sm text-[var(--color-muted)]">Tu rol solo puede consultar.</p> : null}
            <button
              type="button"
              onClick={() => {
                if (showComposer && !confirmDiscardChanges(hasDraftChanges)) return;
                setShowComposer((current) => !current);
              }}
              disabled={!canEdit}
              className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {showComposer ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>
        {showComposer ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)] xl:col-span-2" placeholder="Titulo" disabled={!canEdit || isPending} />
            <input value={draft.related} onChange={(event) => setDraft((current) => ({ ...current, related: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="Relacionado con" disabled={!canEdit || isPending} />
            <input value={draft.dueLabel} onChange={(event) => setDraft((current) => ({ ...current, dueLabel: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="Vence" disabled={!canEdit || isPending} />
            <select value={draft.priority} onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" disabled={!canEdit || isPending}>
              <option>Urgente</option>
              <option>Alta</option>
              <option>Media</option>
            </select>
            <input value={draft.assignee} onChange={(event) => setDraft((current) => ({ ...current, assignee: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="Responsable" disabled={!canEdit || isPending} />
            <button onClick={addTask} disabled={!canEdit || isPending || !draft.title.trim()} className="h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-45">
              {isPending ? "Guardando..." : "Agregar"}
            </button>
            <button onClick={resetDraft} disabled={!canEdit || isPending} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-45">
              Limpiar
            </button>
          </div>
        ) : null}
        {error ? <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p> : null}
        {success ? <p className="mt-3 text-sm text-[var(--color-success)]">{success}</p> : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {filtered.map((task) => {
          const isEditing = editingId === task.id;

          return (
            <article key={task.id} className={`rounded-[28px] border px-5 py-5 ${task.archived ? "border-[var(--color-line)] bg-[var(--color-panel-soft)] opacity-80" : task.done ? "border-[var(--color-success)]/25 bg-[var(--color-success-soft)]" : "border-[var(--color-line)] bg-white"}`}>
              {isEditing ? (
                <div className="space-y-3">
                  {hasEditChanges ? <p className="text-sm text-[var(--color-warning,#b57628)]">Tenes cambios sin guardar en esta edicion.</p> : null}
                  <input value={editingDraft.title} onChange={(event) => setEditingDraft((current) => ({ ...current, title: event.target.value }))} className="h-11 w-full rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" />
                  <input value={editingDraft.related} onChange={(event) => setEditingDraft((current) => ({ ...current, related: event.target.value }))} className="h-11 w-full rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" />
                  <input value={editingDraft.dueLabel} onChange={(event) => setEditingDraft((current) => ({ ...current, dueLabel: event.target.value }))} className="h-11 w-full rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select value={editingDraft.priority} onChange={(event) => setEditingDraft((current) => ({ ...current, priority: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]">
                      <option>Urgente</option>
                      <option>Alta</option>
                      <option>Media</option>
                    </select>
                    <input value={editingDraft.assignee} onChange={(event) => setEditingDraft((current) => ({ ...current, assignee: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Responsable" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={saveEdit} disabled={isPending || !editingDraft.title.trim()} className="rounded-2xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-45">Guardar</button>
                    <button onClick={cancelEdit} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)]">Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">{task.title}</p>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">{task.related}</p>
                    </div>
                    <StatusBadge tone={task.archived ? "neutral" : task.done ? "success" : task.tone}>{task.archived ? "Archivada" : task.done ? "Completada" : task.priority}</StatusBadge>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-muted)]">
                    <span>{task.dueLabel}</span>
                    <span>{task.assignee}</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {!task.archived ? (
                      <button onClick={() => toggleDone(task.id)} disabled={!canEdit || isPending} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-45">
                        {task.done ? "Reabrir" : "Marcar completada"}
                      </button>
                    ) : null}
                    {canEdit ? (
                      <>
                        {!task.archived ? (
                          <button onClick={() => startEditing(task)} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                            Editar
                          </button>
                        ) : null}
                        <button onClick={() => toggleArchived(task)} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                          {task.archived ? "Reactivar" : "Archivar"}
                        </button>
                      </>
                    ) : null}
                  </div>
                </>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
