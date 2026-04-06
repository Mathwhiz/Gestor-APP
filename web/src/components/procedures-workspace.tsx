"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { procedures as seedProcedures } from "@/data/mock-data";

type ProcedureItem = {
  id: string;
  type: string;
  client: string;
  vehicle: string;
  status: string;
  statusTone: "success" | "warning" | "danger" | "neutral" | "info";
  priority: string;
  jurisdiction: string;
  targetDate: string;
};

const filters = ["Todos", "Pendiente de documentacion", "Observado", "Urgente", "La Pampa"] as const;

export function ProceduresWorkspace() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Todos");
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<ProcedureItem[]>(seedProcedures);
  const [draft, setDraft] = useState({
    type: "Transferencia",
    client: "",
    vehicle: "",
    jurisdiction: "La Pampa",
    priority: "Media",
    targetDate: "15/04/2026",
  });

  const filtered = useMemo(
    () =>
      items.filter((procedure) => {
        const matchesSearch =
          !search ||
          `${procedure.type} ${procedure.client} ${procedure.vehicle} ${procedure.jurisdiction}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesFilter =
          activeFilter === "Todos" ||
          procedure.status === activeFilter ||
          procedure.priority === activeFilter ||
          procedure.jurisdiction === activeFilter;
        return matchesSearch && matchesFilter;
      }),
    [activeFilter, items, search],
  );

  function addProcedure() {
    if (!draft.client.trim() || !draft.vehicle.trim()) return;
    setItems((current) => [
      {
        id: `demo-${Date.now()}`,
        type: draft.type,
        client: draft.client,
        vehicle: draft.vehicle,
        jurisdiction: draft.jurisdiction,
        priority: draft.priority,
        targetDate: draft.targetDate,
        status: "Borrador",
        statusTone: "neutral",
      },
      ...current,
    ]);
    setDraft({
      type: "Transferencia",
      client: "",
      vehicle: "",
      jurisdiction: "La Pampa",
      priority: "Media",
      targetDate: "15/04/2026",
    });
    setShowForm(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Gestoria"
        title="Tramites"
        description="Vista principal para filtrar pendientes, observados y urgentes."
        actionLabel={showForm ? "Cerrar carga" : "Crear tramite"}
      />

      <section className="grid gap-4 rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por cliente, dominio, tramite o jurisdiccion"
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

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          {[
            ["Mostrando", String(filtered.length)],
            ["Pendientes", String(items.filter((item) => item.statusTone === "warning").length)],
            ["Observados", String(items.filter((item) => item.statusTone === "danger").length)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              Alta rapida de tramite
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Carga visual en memoria para validar el flujo del MVP.
            </p>
          </div>
          <button
            onClick={() => setShowForm((current) => !current)}
            className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            {showForm ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        {showForm ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <select value={draft.type} onChange={(event) => setDraft((c) => ({ ...c, type: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]">
              <option>Transferencia</option>
              <option>Duplicado de cedula</option>
              <option>Denuncia de venta</option>
              <option>Patentamiento</option>
            </select>
            <input value={draft.client} onChange={(event) => setDraft((c) => ({ ...c, client: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Cliente" />
            <input value={draft.vehicle} onChange={(event) => setDraft((c) => ({ ...c, vehicle: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Vehiculo / dominio" />
            <select value={draft.jurisdiction} onChange={(event) => setDraft((c) => ({ ...c, jurisdiction: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]">
              <option>La Pampa</option>
              <option>Nacional</option>
              <option>Buenos Aires</option>
              <option>CABA</option>
            </select>
            <select value={draft.priority} onChange={(event) => setDraft((c) => ({ ...c, priority: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]">
              <option>Urgente</option>
              <option>Alta</option>
              <option>Media</option>
            </select>
            <button onClick={addProcedure} className="h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]">
              Agregar
            </button>
          </div>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-white">
        <table className="min-w-full divide-y divide-[var(--color-line)] text-left">
          <thead className="bg-[var(--color-panel-soft)] text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            <tr>
              {["Tramite", "Cliente", "Vehiculo", "Estado", "Prioridad", "Jurisdiccion", "Objetivo"].map((heading) => (
                <th key={heading} className="px-5 py-4 font-medium">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {filtered.map((procedure) => (
              <tr key={procedure.id} className="transition hover:bg-[var(--color-panel-soft)]">
                <td className="px-5 py-4">
                  <a href={procedure.id === "transferencia-ranger" ? `/tramites/${procedure.id}` : "#"} className="text-sm font-semibold text-[var(--color-ink)]">
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
                <td className="px-5 py-4 font-mono text-sm text-[var(--color-ink)]">{procedure.targetDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
