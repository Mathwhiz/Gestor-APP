"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";

type VehicleDetail = {
  id: string;
  plate: string;
  name: string;
  owner: string;
  area: string;
  status: string;
  tone: "success" | "warning" | "danger" | "neutral" | "info";
  note: string;
  archived: boolean;
  procedures: {
    id: string;
    type: string;
    client: string;
    status: string;
    statusTone: "success" | "warning" | "danger" | "neutral" | "info";
    priority: string;
    targetDate: string;
  }[];
  operations: {
    id: string;
    type: string;
    status: string;
    tone: "success" | "warning" | "danger" | "neutral" | "info";
    buyer: string;
    seller: string;
    date: string;
    margin: string;
    note: string;
  }[];
};

export function VehicleDetailWorkspace({ detail }: { detail: VehicleDetail }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Ficha de vehiculo"
        title={`${detail.name} - ${detail.plate}`}
        description={`${detail.owner} - ${detail.area}`}
      />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(135deg,#f4eee4_0%,#fbf8f2_100%)] px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Lectura general
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            {detail.name} esta en {detail.status.toLowerCase()} y ya concentra{" "}
            {detail.procedures.length} tramites y {detail.operations.length} operaciones
            relacionadas.
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {[detail.area, detail.owner, `${detail.procedures.length} tramites`, `${detail.operations.length} operaciones`].map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-[var(--color-line)] bg-white px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <div className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Estado
            </p>
            <div className="mt-3">
              <StatusBadge tone={detail.archived ? "neutral" : detail.tone}>
                {detail.archived ? "Archivado" : detail.status}
              </StatusBadge>
            </div>
          </div>
          <div className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Dominio
            </p>
            <p className="mt-3 text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              {detail.plate}
            </p>
          </div>
          <div className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Titular
            </p>
            <p className="mt-3 text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              {detail.owner}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Tramites relacionados" description="Expedientes que usan esta unidad como referencia.">
          <div className="space-y-3">
            {detail.procedures.length === 0 ? (
              <p className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
                No hay tramites vinculados todavia.
              </p>
            ) : (
              detail.procedures.map((procedure) => (
                <Link
                  key={procedure.id}
                  href={`/tramites/${procedure.id}`}
                  className="block rounded-2xl border border-[var(--color-line)] px-4 py-4 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">{procedure.type}</p>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">{procedure.client}</p>
                    </div>
                    <StatusBadge tone={procedure.statusTone}>{procedure.status}</StatusBadge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--color-muted)]">
                    <span className="rounded-full bg-[var(--color-panel-soft)] px-2.5 py-1">
                      {procedure.priority}
                    </span>
                    <span className="rounded-full bg-[var(--color-panel-soft)] px-2.5 py-1">
                      Objetivo {procedure.targetDate}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Observacion interna" description="Lectura operativa rapida.">
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4 text-sm leading-6 text-[var(--color-ink)]">
            {detail.note}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Operaciones relacionadas" description="Movimiento comercial de esta unidad.">
          <div className="space-y-3">
            {detail.operations.length === 0 ? (
              <p className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
                No hay operaciones vinculadas todavia.
              </p>
            ) : (
              detail.operations.map((operation) => (
                <div
                  key={operation.id}
                  className="rounded-2xl border border-[var(--color-line)] px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">{operation.type}</p>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {operation.buyer} / {operation.seller}
                      </p>
                    </div>
                    <StatusBadge tone={operation.tone}>{operation.status}</StatusBadge>
                  </div>
                  <p className="mt-3 text-sm text-[var(--color-muted)]">
                    {operation.date} - Margen {operation.margin}
                  </p>
                  <p className="mt-2 rounded-2xl bg-[var(--color-panel-soft)] px-4 py-3 text-sm text-[var(--color-ink)]">
                    {operation.note}
                  </p>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Atajos" description="Ir al contexto correcto sin buscar de nuevo.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={`/tramites?vehicle=${encodeURIComponent(`${detail.name} - ${detail.plate}`)}&client=${encodeURIComponent(detail.owner)}`}
              className="rounded-2xl border border-[var(--color-line)] px-4 py-4 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
            >
              Nuevo tramite para esta unidad
            </Link>
            <Link
              href={`/operaciones?vehicle=${encodeURIComponent(`${detail.name} - ${detail.plate}`)}&seller=${encodeURIComponent(detail.owner === "Agencia" ? "Agencia" : detail.owner)}`}
              className="rounded-2xl border border-[var(--color-line)] px-4 py-4 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
            >
              Nueva operacion para esta unidad
            </Link>
            <Link
              href="/vehiculos"
              className="rounded-2xl border border-[var(--color-line)] px-4 py-4 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
            >
              Volver a vehiculos
            </Link>
            <Link
              href="/operaciones"
              className="rounded-2xl border border-[var(--color-line)] px-4 py-4 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
            >
              Ver operaciones
            </Link>
            <Link
              href="/tramites"
              className="rounded-2xl border border-[var(--color-line)] px-4 py-4 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
            >
              Ver tramites
            </Link>
            <Link
              href="/dashboard"
              className="rounded-2xl border border-[var(--color-line)] px-4 py-4 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
            >
              Ir al dashboard
            </Link>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
