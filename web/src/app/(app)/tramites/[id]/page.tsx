import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { procedureDetails } from "@/data/mock-data";

type ProcedureDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProcedureDetailPage({
  params,
}: ProcedureDetailPageProps) {
  const { id } = await params;
  const detail = procedureDetails[id];

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Ficha de tramite"
        title={detail.title}
        description={`${detail.client} - ${detail.vehicle} - ${detail.registry}`}
        actionLabel="Actualizar estado"
      />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(135deg,#f4eee4_0%,#fbf8f2_100%)] px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Estado del expediente
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            La carpeta esta avanzada, pero no deberia presentarse hasta cerrar la
            firma certificada y terminar la validacion previa.
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Cliente confirmado", "Verificacion hecha", "Falta firma", "Caja parcial cobrada"].map(
              (pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-[var(--color-line)] bg-white px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]"
                >
                  {pill}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {[
            ["Proximo paso", "Coordinar firma"],
            ["Responsable", "Marcelo"],
            ["Riesgo", "Observacion por incompleto"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {label}
              </p>
              <p className="mt-3 text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {detail.summary.map((item) => (
          <div
            key={item.label}
            className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {item.label}
            </p>
            <div className="mt-3">
              {item.tone ? (
                <StatusBadge tone={item.tone}>{item.value}</StatusBadge>
              ) : (
                <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                  {item.value}
                </p>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <SectionCard title="Checklist documental" description="Estado real del expediente.">
            <div className="space-y-3">
              {detail.requirements.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-[var(--color-line)] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{item.label}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{item.note}</p>
                  </div>
                  <StatusBadge tone={item.done ? "success" : "warning"}>
                    {item.done ? "Recibido" : "Pendiente"}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Historial y seguimiento" description="Movimientos recientes del tramite.">
            <div className="space-y-4">
              {detail.timeline.map((event) => (
                <div key={event.title} className="flex gap-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-[var(--color-accent)]" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{event.title}</p>
                    <p className="text-sm text-[var(--color-muted)]">{event.description}</p>
                    <p className="font-mono text-xs text-[var(--color-muted)]">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Caja vinculada" description="Gastos e ingresos relacionados.">
            <div className="space-y-3">
              {detail.movements.map((movement) => (
                <div
                  key={movement.label}
                  className="flex items-center justify-between rounded-2xl border border-[var(--color-line)] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{movement.label}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{movement.meta}</p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      movement.amount.startsWith("+")
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-danger)]"
                    }`}
                  >
                    {movement.amount}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Acciones sugeridas" description="Acciones rapidas sobre este tramite.">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Marcar requisito recibido",
                "Cargar gasto",
                "Agregar nota",
                "Abrir guia",
              ].map((action) => (
                <button
                  key={action}
                  className="rounded-2xl border border-[var(--color-line)] px-4 py-4 text-left text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
                >
                  {action}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Ayuda contextual" description="Guia rapida para este tramite.">
            <div className="space-y-4">
              <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
                <p className="text-sm font-semibold text-[var(--color-ink)]">{detail.guide.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                  {detail.guide.summary}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Pasos sugeridos
                </p>
                {detail.guide.steps.map((step, index) => (
                  <div
                    key={step}
                    className="flex gap-3 rounded-2xl border border-[var(--color-line)] px-4 py-3"
                  >
                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)]/12 text-xs font-semibold text-[var(--color-accent)]">
                      {index + 1}
                    </span>
                    <p className="text-sm text-[var(--color-ink)]">{step}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Links utiles
                </p>
                {detail.guide.links.map((link) => (
                  <div
                    key={link.label}
                    className="rounded-2xl border border-[var(--color-line)] px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{link.label}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">{link.href}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Notas operativas" description="Criterios internos y observaciones.">
            <div className="space-y-3 text-sm leading-6 text-[var(--color-muted)]">
              {detail.notes.map((note) => (
                <p key={note} className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-3">
                  {note}
                </p>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
