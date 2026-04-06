import { PageHeader } from "@/components/page-header";
import { movements } from "@/data/mock-data";

export default function FinancePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Finanzas"
        title="Libro de movimientos"
        description="Caja diaria, gastos, cobros y separacion por area de negocio."
        actionLabel="Nuevo movimiento"
      />

      <section className="flex flex-wrap gap-3 rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-4">
        {["Todos", "Ingresos", "Egresos", "Gestoria", "Agencia", "General", "Personal"].map(
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
              {["Fecha", "Descripcion", "Categoria", "Area", "Cuenta", "Importe"].map((heading) => (
                <th key={heading} className="px-5 py-4 font-medium">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {movements.map((movement) => (
              <tr key={movement.id} className="transition hover:bg-[var(--color-panel-soft)]">
                <td className="px-5 py-4 font-mono text-sm text-[var(--color-muted)]">
                  {movement.date}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-[var(--color-ink)]">
                  {movement.description}
                </td>
                <td className="px-5 py-4 text-sm text-[var(--color-muted)]">{movement.category}</td>
                <td className="px-5 py-4 text-sm text-[var(--color-muted)]">{movement.area}</td>
                <td className="px-5 py-4 text-sm text-[var(--color-muted)]">{movement.account}</td>
                <td
                  className={`px-5 py-4 text-sm font-semibold ${
                    movement.amount.startsWith("+")
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-danger)]"
                  }`}
                >
                  {movement.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
