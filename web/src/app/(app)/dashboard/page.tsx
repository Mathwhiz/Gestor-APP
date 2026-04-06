import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { SummaryCard } from "@/components/summary-card";
import { getDashboardData } from "@/lib/data";

export default async function DashboardPage() {
  const { tasks, procedures, summaries, movements, guides } = await getDashboardData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Vista general"
        title="Dashboard operativo"
        description="Resumen del dia para gestoria, agencia y caja. La base operativa contempla La Pampa y tramites con criterios nacionales."
        actionLabel="Nuevo tramite"
      />

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(135deg,#163742_0%,#214e5c_52%,#285d6c_100%)] px-6 py-6 text-white sm:px-7">
          <p className="text-xs uppercase tracking-[0.22em] text-white/55">Lectura rapida</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                La manana arranca con 2 tramites observados y 4 carpetas para mover.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/74">
                Lo prioritario hoy es cerrar documentacion de la Ranger, revisar la
                observacion del patentamiento y cobrar dos tramites ya terminados.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["Registro", "Santa Rosa 2"],
                ["Caja gestoría", "$ 814.000"],
                ["Cobros hoy", "3 por confirmar"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SectionCard
          title="Atajos de trabajo"
          description="Lo mas comun sin salir del dashboard."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Nuevo ingreso",
              "Cargar egreso",
              "Agregar cliente",
              "Abrir guia",
              "Actualizar tramite",
              "Crear tarea",
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
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaries.map((summary) => (
          <SummaryCard key={summary.title} {...summary} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard
          title="Tramites que piden accion"
          description="Lo que deberia ordenarse primero hoy."
        >
          <div className="space-y-3">
            {procedures.slice(0, 4).map((procedure) => (
              <a
                key={procedure.id}
                href={`/tramites/${procedure.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 py-4 transition hover:border-[var(--color-accent)]/40 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      {procedure.type}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {procedure.client} - {procedure.vehicle}
                    </p>
                  </div>
                  <StatusBadge tone={procedure.statusTone}>{procedure.status}</StatusBadge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-[var(--color-muted)]">
                  <span className="rounded-full bg-white px-2.5 py-1">{procedure.priority}</span>
                  <span className="rounded-full bg-white px-2.5 py-1">{procedure.jurisdiction}</span>
                  <span className="rounded-full bg-white px-2.5 py-1">
                    Objetivo {procedure.targetDate}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Tareas y alertas" description="Pendientes inmediatos del dia.">
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{task.title}</p>
                  <StatusBadge tone={task.tone}>{task.priority}</StatusBadge>
                </div>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {task.related} - {task.dueLabel}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Ultimos movimientos" description="Caja y gastos recientes.">
          <div className="space-y-3">
            {movements.slice(0, 5).map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between rounded-2xl border border-[var(--color-line)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    {movement.description}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    {movement.category} - {movement.area}
                  </p>
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

        <SectionCard title="Ayudas frecuentes" description="Guias rapidas para no salir del flujo.">
          <div className="space-y-3">
            {guides.map((guide) => (
              <div
                key={guide.id}
                className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{guide.title}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {guide.summary}
                    </p>
                  </div>
                  <StatusBadge tone="neutral">{guide.scope}</StatusBadge>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  {guide.jurisdiction}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
