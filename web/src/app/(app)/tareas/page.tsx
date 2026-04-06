import { PageHeader } from "@/components/page-header";
import { tasks } from "@/data/mock-data";
import { StatusBadge } from "@/components/status-badge";

export default function TasksPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Agenda"
        title="Tareas"
        description="Seguimiento corto del dia, tareas vencidas y proximos movimientos."
        actionLabel="Nueva tarea"
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {tasks.map((task) => (
          <article
            key={task.id}
            className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                  {task.title}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{task.related}</p>
              </div>
              <StatusBadge tone={task.tone}>{task.priority}</StatusBadge>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-muted)]">
              <span>{task.dueLabel}</span>
              <span>{task.assignee}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
