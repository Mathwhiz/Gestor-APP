import { DashboardQuickActions } from "@/components/dashboard-quick-actions";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { SummaryCard } from "@/components/summary-card";
import { canEditRole, requireAuthenticatedAppUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";

export default async function DashboardPage() {
  const { profile } = await requireAuthenticatedAppUser();
  const dashboardData = await getDashboardData();
  const { tasks, procedures, summaries, movements, guides, operations, quickStats } =
    dashboardData;

  type DashboardData = typeof dashboardData;
  type SummaryItem = DashboardData["summaries"][number];
  type ProcedureItem = DashboardData["procedures"][number];
  type TaskItem = DashboardData["tasks"][number];
  type MovementItem = DashboardData["movements"][number];
  type GuideItem = DashboardData["guides"][number];
  type OperationItem = DashboardData["operations"][number];
  type AgendaItem = TaskItem | ProcedureItem;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Vista general"
        title="Dashboard operativo"
        description="Lectura central de gestoria, agencia y caja con datos reales cargados en la base."
        actionLabel="Nuevo tramite"
        actionHref={canEditRole(profile.role) ? "/tramites?create=1" : undefined}
        actionDisabled={!canEditRole(profile.role)}
      />

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[24px] border border-[var(--color-line)] bg-[linear-gradient(135deg,#163742_0%,#214e5c_52%,#285d6c_100%)] px-4 py-5 text-white sm:rounded-[28px] sm:px-7 sm:py-6">
          <p className="text-xs uppercase tracking-[0.22em] text-white/55">Lectura rapida</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Hay {quickStats.observedProcedures} tramites observados y {quickStats.urgentProcedures} frentes que piden accion hoy.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/74 sm:leading-7">
                El tablero ya cruza tramites, tareas, caja y operaciones activas sin depender de
                textos fijos del prototipo.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 lg:grid-cols-1">
              {[
                ["Observados", String(quickStats.observedProcedures)],
                ["Docs pendientes", String(quickStats.missingDocuments)],
                ["Caja actual", `$ ${Math.abs(quickStats.cashBalance).toLocaleString("es-AR")}`],
                ["Cobros cargados", `$ ${quickStats.pendingCollections.toLocaleString("es-AR")}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SectionCard title="Acciones rapidas" description="Altas reales sin salir del dashboard.">
          <DashboardQuickActions canEdit={canEditRole(profile.role)} />
        </SectionCard>
      </section>

      <section className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaries.map((summary: SummaryItem) => (
          <SummaryCard key={summary.title} {...summary} />
        ))}
      </section>

      <section className="grid gap-4 sm:gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard title="Tramites que piden accion" description="Lo que deberia ordenarse primero hoy.">
          <div className="space-y-3">
            {procedures.slice(0, 4).map((procedure: ProcedureItem) => (
              <a
                key={procedure.id}
                href={`/tramites/${procedure.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 py-4 transition hover:border-[var(--color-accent)]/40 hover:bg-white"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{procedure.type}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {procedure.client} - {procedure.vehicle}
                    </p>
                  </div>
                  <StatusBadge tone={procedure.statusTone}>{procedure.status}</StatusBadge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-[var(--color-muted)]">
                  <span className="rounded-full bg-white px-2.5 py-1">{procedure.priority}</span>
                  <span className="rounded-full bg-white px-2.5 py-1">{procedure.jurisdiction}</span>
                  <span className="rounded-full bg-white px-2.5 py-1">Objetivo {procedure.targetDate}</span>
                </div>
              </a>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Tareas y alertas" description="Pendientes inmediatos del dia.">
          <div className="space-y-3">
            {tasks.map((task: TaskItem) => (
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

      <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <SectionCard title="Ultimos movimientos" description="Caja y gastos recientes.">
          <div className="space-y-3">
            {movements.slice(0, 5).map((movement: MovementItem) => (
              <div
                key={movement.id}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--color-line)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{movement.description}</p>
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
            {guides.map((guide: GuideItem) => (
              <a
                key={guide.id}
                href="/ayudas"
                className="block rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 py-4 transition hover:border-[var(--color-accent)]/40 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{guide.title}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{guide.summary}</p>
                  </div>
                  <StatusBadge tone="neutral">{guide.scope}</StatusBadge>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  {guide.jurisdiction}
                </p>
              </a>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <SectionCard title="Operaciones activas" description="Negocio de agencia y stock en seguimiento.">
          <div className="space-y-3">
            {operations.slice(0, 4).map((operation: OperationItem) => (
              <div
                key={operation.id}
                className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 py-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{operation.type}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{operation.vehicle}</p>
                  </div>
                  <StatusBadge tone={operation.tone}>{operation.status}</StatusBadge>
                </div>
                <p className="mt-3 text-sm text-[var(--color-muted)]">
                  Margen {operation.margin} - {operation.note}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Agenda inmediata" description="Cruce rapido entre tareas y tramites urgentes.">
          <div className="space-y-3">
            {[...tasks.slice(0, 2), ...procedures.slice(0, 2)].map((item: AgendaItem) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[var(--color-line)] px-4 py-4"
              >
                {"related" in item ? (
                  <>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{item.title}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {item.related} - {item.dueLabel}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{item.type}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {item.client} - {item.targetDate}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
