"use client";

import { useMemo, useState, useTransition } from "react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { procedures as mockProcedures } from "@/data/mock-data";
import { createProcedureAction } from "@/app/(app)/actions";

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

export function ProceduresWorkspace({
  initialItems = mockProcedures,
  contactOptions = [],
  vehicleOptions = [],
  initialDraft,
  initialShowForm = false,
  canEdit,
}: {
  initialItems?: ProcedureItem[];
  contactOptions?: { id: string; name: string }[];
  vehicleOptions?: { id: string; label: string }[];
  initialDraft?: Partial<{
    type: string;
    client: string;
    vehicle: string;
    jurisdiction: string;
    priority: string;
    targetDate: string;
  }>;
  initialShowForm?: boolean;
  canEdit: boolean;
}) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Todos");
  const [showForm, setShowForm] = useState(initialShowForm);
  const [items, setItems] = useState<ProcedureItem[]>(initialItems);
  const [draft, setDraft] = useState({
    type: "Transferencia",
    client: "",
    vehicle: "",
    jurisdiction: "La Pampa",
    priority: "Media",
    targetDate: "15/04/2026",
    ...initialDraft,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

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
    if (!canEdit || !draft.client.trim() || !draft.vehicle.trim()) return;

    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await createProcedureAction(draft);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) => [result.item, ...current]);
      setDraft({
        type: "Transferencia",
        client: "",
        vehicle: "",
        jurisdiction: "La Pampa",
        priority: "Media",
        targetDate: "15/04/2026",
      });
      setShowForm(false);
      setSuccess("Tramite creado correctamente.");
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Gestoria"
        title="Tramites"
        description="Vista principal para filtrar pendientes, observados y urgentes."
        actionLabel={showForm ? "Cerrar carga" : "Crear tramite"}
        actionDisabled={!canEdit}
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
              Alta real sobre la base operativa para arrancar el seguimiento.
            </p>
          </div>
          <button
            onClick={() => setShowForm((current) => !current)}
            disabled={!canEdit}
            className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {showForm ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        {!canEdit ? (
          <p className="mb-4 text-sm text-[var(--color-muted)]">Tu rol solo puede consultar.</p>
        ) : null}

        {showForm ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <select
              value={draft.type}
              onChange={(event) => setDraft((c) => ({ ...c, type: event.target.value }))}
              className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
              disabled={isPending}
            >
              <option>Transferencia</option>
              <option>Duplicado de cedula</option>
              <option>Denuncia de venta</option>
              <option>Patentamiento</option>
            </select>
            <select
              value={draft.client}
              onChange={(event) => setDraft((c) => ({ ...c, client: event.target.value }))}
              className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
              disabled={isPending}
            >
              <option value="">Seleccionar cliente</option>
              {contactOptions.map((contact) => (
                <option key={contact.id} value={contact.name}>
                  {contact.name}
                </option>
              ))}
            </select>
            <select
              value={draft.vehicle}
              onChange={(event) => setDraft((c) => ({ ...c, vehicle: event.target.value }))}
              className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
              disabled={isPending}
            >
              <option value="">Seleccionar vehiculo</option>
              {vehicleOptions.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.label}>
                  {vehicle.label}
                </option>
              ))}
            </select>
            <select
              value={draft.jurisdiction}
              onChange={(event) => setDraft((c) => ({ ...c, jurisdiction: event.target.value }))}
              className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
              disabled={isPending}
            >
              <option>La Pampa</option>
              <option>Nacional</option>
              <option>Buenos Aires</option>
              <option>CABA</option>
            </select>
            <select
              value={draft.priority}
              onChange={(event) => setDraft((c) => ({ ...c, priority: event.target.value }))}
              className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
              disabled={isPending}
            >
              <option>Urgente</option>
              <option>Alta</option>
              <option>Media</option>
            </select>
            <button
              onClick={addProcedure}
              disabled={isPending}
              className="h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:opacity-45"
            >
              {isPending ? "Guardando..." : "Agregar"}
            </button>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p> : null}
        {success ? <p className="mt-3 text-sm text-[var(--color-success)]">{success}</p> : null}
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
                  <a href={`/tramites/${procedure.id}`} className="text-sm font-semibold text-[var(--color-ink)]">
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
