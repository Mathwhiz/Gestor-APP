"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { tasks as mockTasks } from "@/data/mock-data";

type TaskItem = {
  id: string;
  title: string;
  related: string;
  dueLabel: string;
  priority: string;
  assignee: string;
  tone: "success" | "warning" | "danger" | "neutral" | "info";
  done?: boolean;
};

const filters = ["Todas", "Urgente", "Alta", "Media", "Completadas"] as const;

export function TasksWorkspace({
  initialItems = mockTasks,
}: {
  initialItems?: TaskItem[];
}) {
  const [items, setItems] = useState<TaskItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Todas");
  const [draft, setDraft] = useState({
    title: "",
    related: "Tramite general",
    dueLabel: "Hoy - 18:00",
    priority: "Media",
    assignee: "Marcelo",
  });

  const filtered = useMemo(
    () =>
      items.filter((task) => {
        const matchesSearch =
          !search ||
          `${task.title} ${task.related} ${task.assignee}`.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
          activeFilter === "Todas" ||
          (activeFilter === "Completadas" ? task.done : task.priority === activeFilter);
        return matchesSearch && matchesFilter;
      }),
    [activeFilter, items, search],
  );

  function toggleDone(id: string) {
    setItems((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, done: !task.done, tone: !task.done ? "success" : task.tone }
          : task,
      ),
    );
  }

  function addTask() {
    if (!draft.title.trim()) return;
    const tone =
      draft.priority === "Urgente"
        ? "danger"
        : draft.priority === "Alta"
          ? "warning"
          : "info";
    setItems((current) => [
      {
        id: `task-${Date.now()}`,
        title: draft.title,
        related: draft.related,
        dueLabel: draft.dueLabel,
        priority: draft.priority,
        assignee: draft.assignee,
        tone,
        done: false,
      },
      ...current,
    ]);
    setDraft({
      title: "",
      related: "Tramite general",
      dueLabel: "Hoy - 18:00",
      priority: "Media",
      assignee: "Marcelo",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Agenda"
        title="Tareas"
        description="Seguimiento corto del dia, tareas vencidas y proximos movimientos."
        actionLabel="Nueva tarea"
      />

      <section className="grid gap-4 rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por tarea, responsable o entidad relacionada"
            className="h-12 w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  activeFilter === filter
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Pendientes</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              {items.filter((task) => !task.done).length}
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Urgentes</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              {items.filter((task) => task.priority === "Urgente" && !task.done).length}
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Completadas</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              {items.filter((task) => task.done).length}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
        <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Alta rapida de tarea</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
            placeholder="Titulo"
          />
          <input
            value={draft.related}
            onChange={(event) => setDraft((current) => ({ ...current, related: event.target.value }))}
            className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
            placeholder="Relacionado con"
          />
          <input
            value={draft.dueLabel}
            onChange={(event) => setDraft((current) => ({ ...current, dueLabel: event.target.value }))}
            className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
            placeholder="Vence"
          />
          <select
            value={draft.priority}
            onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value }))}
            className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
          >
            <option>Urgente</option>
            <option>Alta</option>
            <option>Media</option>
          </select>
          <button
            onClick={addTask}
            className="h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
          >
            Agregar
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {filtered.map((task) => (
          <article
            key={task.id}
            className={`rounded-[28px] border px-5 py-5 ${
              task.done
                ? "border-[var(--color-success)]/25 bg-[var(--color-success-soft)]"
                : "border-[var(--color-line)] bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                  {task.title}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{task.related}</p>
              </div>
              <StatusBadge tone={task.done ? "success" : task.tone}>
                {task.done ? "Completada" : task.priority}
              </StatusBadge>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-muted)]">
              <span>{task.dueLabel}</span>
              <span>{task.assignee}</span>
            </div>
            <button
              onClick={() => toggleDone(task.id)}
              className="mt-5 rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              {task.done ? "Reabrir" : "Marcar completada"}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
