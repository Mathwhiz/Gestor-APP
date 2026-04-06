import { PageHeader } from "@/components/page-header";
import { procedures } from "@/data/mock-data";
import { StatusBadge } from "@/components/status-badge";

export default function ProceduresPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Gestoria"
        title="Tramites"
        description="Vista principal para filtrar pendientes, observados y urgentes."
        actionLabel="Crear tramite"
      />

      <section className="flex flex-wrap gap-3 rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-4">
        {["Todos", "Pendiente de documentacion", "Observado", "Urgente", "La Pampa"].map(
          (filter) => (
            <button
              key={filter}
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              {filter}
            </button>
          ),
        )}
      </section>

      <section className="overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-white">
        <table className="min-w-full divide-y divide-[var(--color-line)] text-left">
          <thead className="bg-[var(--color-panel-soft)] text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            <tr>
              {["Tramite", "Cliente", "Vehiculo", "Estado", "Prioridad", "Jurisdiccion", "Objetivo"].map(
                (heading) => (
                  <th key={heading} className="px-5 py-4 font-medium">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {procedures.map((procedure) => (
              <tr key={procedure.id} className="transition hover:bg-[var(--color-panel-soft)]">
                <td className="px-5 py-4">
                  <a
                    href={`/tramites/${procedure.id}`}
                    className="text-sm font-semibold text-[var(--color-ink)]"
                  >
                    {procedure.type}
                  </a>
                </td>
                <td className="px-5 py-4 text-sm text-[var(--color-muted)]">{procedure.client}</td>
                <td className="px-5 py-4 text-sm text-[var(--color-muted)]">{procedure.vehicle}</td>
                <td className="px-5 py-4">
                  <StatusBadge tone={procedure.statusTone}>{procedure.status}</StatusBadge>
                </td>
                <td className="px-5 py-4 text-sm text-[var(--color-muted)]">{procedure.priority}</td>
                <td className="px-5 py-4 text-sm text-[var(--color-muted)]">{procedure.jurisdiction}</td>
                <td className="px-5 py-4 font-mono text-sm text-[var(--color-ink)]">
                  {procedure.targetDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
