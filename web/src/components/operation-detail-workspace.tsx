"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";

type OperationDetail = {
  id: string;
  type: string;
  vehicle: string;
  buyer: string;
  seller: string;
  date: string;
  agreedPrice: string;
  realCost: string;
  commission: string;
  margin: string;
  status: string;
  tone: "success" | "warning" | "danger" | "neutral" | "info";
  note: string;
  vehicleRef: { id: string; label: string } | null;
  buyerRef: { id: string; label: string } | null;
  sellerRef: { id: string; label: string } | null;
  relatedProcedures: {
    id: string;
    type: string;
    client: string;
    status: string;
    statusTone: "success" | "warning" | "danger" | "neutral" | "info";
    targetDate: string;
  }[];
};

export function OperationDetailWorkspace({ detail }: { detail: OperationDetail }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Ficha de operacion"
        title={`${detail.type} - ${detail.vehicle}`}
        description={`${detail.buyer} / ${detail.seller}`}
      />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(135deg,#f4eee4_0%,#fbf8f2_100%)] px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Lectura general
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Operacion {detail.status.toLowerCase()} con margen proyectado de {detail.margin}.
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {[detail.date, detail.type, detail.buyer, detail.seller].map((pill) => (
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
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Estado</p>
            <div className="mt-3">
              <StatusBadge tone={detail.tone}>{detail.status}</StatusBadge>
            </div>
          </div>
          <div className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Pactado</p>
            <p className="mt-3 text-lg font-semibold tracking-tight text-[var(--color-ink)]">{detail.agreedPrice}</p>
          </div>
          <div className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Costo real</p>
            <p className="mt-3 text-lg font-semibold tracking-tight text-[var(--color-ink)]">{detail.realCost}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Datos economicos" description="Lectura rapida de cierre y margen.">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Precio pactado", detail.agreedPrice],
              ["Costo real", detail.realCost],
              ["Comision", detail.commission],
              ["Margen", detail.margin],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">{label}</p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-[var(--color-ink)]">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Nota operativa" description="Estado comercial de la operacion.">
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4 text-sm leading-6 text-[var(--color-ink)]">
            {detail.note}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Tramites relacionados" description="Seguimiento administrativo conectado a esta operacion.">
          <div className="space-y-3">
            {detail.relatedProcedures.length === 0 ? (
              <p className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
                No hay tramites relacionados todavia.
              </p>
            ) : (
              detail.relatedProcedures.map((procedure) => (
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
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    Objetivo {procedure.targetDate}
                  </p>
                </Link>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Atajos" description="Ir al contexto correcto sin reescribir datos.">
          <div className="grid gap-3 sm:grid-cols-2">
            {detail.vehicleRef ? (
              <Link
                href={`/vehiculos/${detail.vehicleRef.id}`}
                className="rounded-2xl border border-[var(--color-line)] px-4 py-4 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
              >
                Ver vehiculo
              </Link>
            ) : null}
            {detail.buyerRef ? (
              <Link
                href={`/contactos/${detail.buyerRef.id}`}
                className="rounded-2xl border border-[var(--color-line)] px-4 py-4 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
              >
                Ver comprador
              </Link>
            ) : null}
            {detail.sellerRef ? (
              <Link
                href={`/contactos/${detail.sellerRef.id}`}
                className="rounded-2xl border border-[var(--color-line)] px-4 py-4 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
              >
                Ver vendedor
              </Link>
            ) : null}
            <Link
              href="/operaciones"
              className="rounded-2xl border border-[var(--color-line)] px-4 py-4 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
            >
              Volver a operaciones
            </Link>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
