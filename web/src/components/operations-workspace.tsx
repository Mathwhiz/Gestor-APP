"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { operations as mockOperations } from "@/data/mock-data";
import { createOperationAction, updateOperationAction } from "@/app/(app)/actions";
import { confirmDiscardChanges, useUnsavedChanges } from "@/hooks/use-unsaved-changes";

type OperationItem = {
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
};

const filters = ["Todas", "Abierta", "Reservada", "Cerrada", "Venta", "Compra", "Consignacion"] as const;

export function OperationsWorkspace({
  initialItems = mockOperations,
  contactOptions = [],
  vehicleOptions = [],
  initialDraft,
  initialShowForm = false,
  canEdit,
}: {
  initialItems?: OperationItem[];
  contactOptions?: { id: string; name: string }[];
  vehicleOptions?: { id: string; label: string }[];
  initialDraft?: Partial<{
    type: string;
    vehicle: string;
    buyer: string;
    seller: string;
    date: string;
    agreedPrice: string;
    realCost: string;
    commission: string;
    margin: string;
    note: string;
  }>;
  initialShowForm?: boolean;
  canEdit: boolean;
}) {
  const [items, setItems] = useState<OperationItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Todas");
  const [showForm, setShowForm] = useState(initialShowForm);
  const [draft, setDraft] = useState({
    type: "Venta",
    vehicle: "",
    buyer: "",
    seller: "Agencia",
    date: "06/04/2026",
    agreedPrice: "$ 0",
    realCost: "$ 0",
    commission: "$ 0",
    margin: "$ 0",
    note: "",
    ...initialDraft,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState({
    type: "Venta",
    vehicle: "",
    buyer: "",
    seller: "",
    date: "",
    agreedPrice: "",
    realCost: "",
    commission: "",
    margin: "",
    note: "",
    status: "Abierta",
  });
  const [editingInitial, setEditingInitial] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      items.filter((operation) => {
        const matchesSearch =
          !search ||
          `${operation.type} ${operation.vehicle} ${operation.buyer} ${operation.seller}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesFilter =
          activeFilter === "Todas" ||
          operation.status === activeFilter ||
          operation.type === activeFilter;
        return matchesSearch && matchesFilter;
      }),
    [activeFilter, items, search],
  );

  const openMargin = filtered
    .filter((item: (typeof filtered)[number]) => item.status !== "Cerrada")
    .reduce(
      (total: number, item: (typeof filtered)[number]) =>
        total + Number(item.margin.replace(/[^\d-]/g, "")),
      0,
    );
  const hasDraftChanges = Boolean(
    draft.type !== "Venta" ||
      draft.vehicle.trim() ||
      draft.buyer.trim() ||
      draft.seller !== "Agencia" ||
      draft.date !== "06/04/2026" ||
      draft.agreedPrice !== "$ 0" ||
      draft.realCost !== "$ 0" ||
      draft.commission !== "$ 0" ||
      draft.margin !== "$ 0" ||
      draft.note.trim(),
  );
  const hasEditChanges =
    editingId !== null &&
    JSON.stringify(editingDraft) !== editingInitial;

  useUnsavedChanges((showForm && hasDraftChanges) || hasEditChanges);

  function addOperation() {
    if (!canEdit || !draft.vehicle.trim()) return;

    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await createOperationAction(draft);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) => [result.item, ...current]);
      setDraft({
        type: "Venta",
        vehicle: "",
        buyer: "",
        seller: "Agencia",
        date: "06/04/2026",
        agreedPrice: "$ 0",
        realCost: "$ 0",
        commission: "$ 0",
        margin: "$ 0",
        note: "",
      });
      setShowForm(false);
      setSuccess("Operacion creada correctamente.");
    });
  }

  function startEditing(operation: OperationItem) {
    setError("");
    setSuccess("");
    setEditingId(operation.id);
    const nextDraft = {
      type: operation.type,
      vehicle: operation.vehicle,
      buyer: operation.buyer === "Sin comprador" ? "" : operation.buyer,
      seller: operation.seller === "Sin vendedor" ? "" : operation.seller,
      date: operation.date,
      agreedPrice: operation.agreedPrice,
      realCost: operation.realCost,
      commission: operation.commission,
      margin: operation.margin,
      note: operation.note === "Sin observaciones" ? "" : operation.note,
      status: operation.status,
    };
    setEditingDraft(nextDraft);
    setEditingInitial(JSON.stringify(nextDraft));
  }

  function saveEdit() {
    if (!canEdit || !editingId) return;

    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await updateOperationAction({
        id: editingId,
        ...editingDraft,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) =>
        current.map((operation) => (operation.id === editingId ? result.item : operation)),
      );
      setEditingId(null);
      setEditingInitial("");
      setSuccess("Operacion actualizada.");
    });
  }

  function resetDraft() {
    if (!confirmDiscardChanges(hasDraftChanges)) return;
    setDraft({
      type: "Venta",
      vehicle: "",
      buyer: "",
      seller: "Agencia",
      date: "06/04/2026",
      agreedPrice: "$ 0",
      realCost: "$ 0",
      commission: "$ 0",
      margin: "$ 0",
      note: "",
    });
    setError("");
    setSuccess("");
  }

  function cancelEdit() {
    if (!confirmDiscardChanges(hasEditChanges)) return;
    setEditingId(null);
    setEditingInitial("");
    setError("");
    setSuccess("");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Agencia"
        title="Operaciones"
        description="Stock, ventas, compras y consignaciones con foco en margen y cierre."
        actionLabel="Nueva operacion"
        actionDisabled={!canEdit}
      />

      <section className="grid gap-4 rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por tipo, unidad, comprador o vendedor" className="h-12 w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" />
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button key={filter} onClick={() => setActiveFilter(filter)} className={`rounded-full border px-4 py-2 text-sm transition ${activeFilter === filter ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white" : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"}`}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Activas</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{items.filter((item) => item.status !== "Cerrada").length}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Cerradas</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{items.filter((item) => item.status === "Cerrada").length}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Margen abierto</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">$ {openMargin.toLocaleString("es-AR")}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Alta rapida de operacion</p>
            {showForm && hasDraftChanges ? <p className="mt-1 text-sm text-[var(--color-warning,#b57628)]">Tenes cambios sin guardar en el alta.</p> : null}
          </div>
          <div className="flex items-center gap-3">
            {!canEdit ? <p className="text-sm text-[var(--color-muted)]">Tu rol solo puede consultar.</p> : null}
            <button onClick={() => {
              if (showForm && !confirmDiscardChanges(hasDraftChanges)) return;
              setShowForm((current) => !current);
            }} disabled={!canEdit} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-45">
              {showForm ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        {showForm ? (
        <>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <select value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" disabled={!canEdit || isPending}>
            <option>Venta</option>
            <option>Compra</option>
            <option>Consignacion</option>
            <option>Reserva</option>
            <option>Permuta</option>
          </select>
          <select value={draft.vehicle} onChange={(event) => setDraft((current) => ({ ...current, vehicle: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)] xl:col-span-2" disabled={!canEdit || isPending}>
            <option value="">Seleccionar vehiculo</option>
            {vehicleOptions.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.label}>
                {vehicle.label}
              </option>
            ))}
          </select>
          <select value={draft.buyer} onChange={(event) => setDraft((current) => ({ ...current, buyer: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" disabled={!canEdit || isPending}>
            <option value="">Seleccionar comprador</option>
            {contactOptions.map((contact) => (
              <option key={contact.id} value={contact.name}>
                {contact.name}
              </option>
            ))}
          </select>
          <select value={draft.seller} onChange={(event) => setDraft((current) => ({ ...current, seller: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" disabled={!canEdit || isPending}>
            <option value="">Seleccionar vendedor</option>
            <option value="Agencia">Agencia</option>
            {contactOptions.map((contact) => (
              <option key={contact.id} value={contact.name}>
                {contact.name}
              </option>
            ))}
          </select>
          <button onClick={addOperation} disabled={!canEdit || isPending || !draft.vehicle.trim()} className="h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-45">
            {isPending ? "Guardando..." : "Agregar"}
          </button>
          <input value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="Fecha" disabled={!canEdit || isPending} />
          <input value={draft.agreedPrice} onChange={(event) => setDraft((current) => ({ ...current, agreedPrice: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="Precio pactado" disabled={!canEdit || isPending} />
          <input value={draft.realCost} onChange={(event) => setDraft((current) => ({ ...current, realCost: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="Costo real" disabled={!canEdit || isPending} />
          <input value={draft.commission} onChange={(event) => setDraft((current) => ({ ...current, commission: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="Comision" disabled={!canEdit || isPending} />
          <input value={draft.margin} onChange={(event) => setDraft((current) => ({ ...current, margin: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="Margen" disabled={!canEdit || isPending} />
        </div>
        <textarea value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} className="mt-3 min-h-24 w-full rounded-2xl border border-[var(--color-line)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="Nota operativa" disabled={!canEdit || isPending} />
        {showForm ? (
          <div className="mt-3 flex flex-wrap gap-3">
            <button onClick={resetDraft} disabled={!canEdit || isPending} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-45">
              Limpiar
            </button>
            <button onClick={() => {
              resetDraft();
              setShowForm(false);
            }} disabled={!canEdit || isPending} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-45">
              Cancelar carga
            </button>
          </div>
        ) : null}
        </>
        ) : null}
        {error ? <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p> : null}
        {success ? <p className="mt-3 text-sm text-[var(--color-success)]">{success}</p> : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {filtered.map((operation) => {
          const isEditing = editingId === operation.id;

          return (
            <article key={operation.id} className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
              {isEditing ? (
                <div className="space-y-3">
                  {hasEditChanges ? <p className="text-sm text-[var(--color-warning,#b57628)]">Tenes cambios sin guardar en esta edicion.</p> : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select value={editingDraft.type} onChange={(event) => setEditingDraft((current) => ({ ...current, type: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]">
                      <option>Venta</option>
                      <option>Compra</option>
                      <option>Consignacion</option>
                      <option>Reserva</option>
                      <option>Permuta</option>
                    </select>
                    <select value={editingDraft.status} onChange={(event) => setEditingDraft((current) => ({ ...current, status: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]">
                      <option>Abierta</option>
                      <option>Reservada</option>
                      <option>Cerrada</option>
                      <option>Anulada</option>
                    </select>
                    <select value={editingDraft.vehicle} onChange={(event) => setEditingDraft((current) => ({ ...current, vehicle: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] sm:col-span-2">
                      <option value="">Seleccionar vehiculo</option>
                      {vehicleOptions.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.label}>
                          {vehicle.label}
                        </option>
                      ))}
                    </select>
                    <select value={editingDraft.buyer} onChange={(event) => setEditingDraft((current) => ({ ...current, buyer: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]">
                      <option value="">Seleccionar comprador</option>
                      {contactOptions.map((contact) => (
                        <option key={contact.id} value={contact.name}>
                          {contact.name}
                        </option>
                      ))}
                    </select>
                    <select value={editingDraft.seller} onChange={(event) => setEditingDraft((current) => ({ ...current, seller: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]">
                      <option value="">Seleccionar vendedor</option>
                      <option value="Agencia">Agencia</option>
                      {contactOptions.map((contact) => (
                        <option key={contact.id} value={contact.name}>
                          {contact.name}
                        </option>
                      ))}
                    </select>
                    <input value={editingDraft.date} onChange={(event) => setEditingDraft((current) => ({ ...current, date: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Fecha" />
                    <input value={editingDraft.agreedPrice} onChange={(event) => setEditingDraft((current) => ({ ...current, agreedPrice: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Precio pactado" />
                    <input value={editingDraft.realCost} onChange={(event) => setEditingDraft((current) => ({ ...current, realCost: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Costo real" />
                    <input value={editingDraft.commission} onChange={(event) => setEditingDraft((current) => ({ ...current, commission: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Comision" />
                    <input value={editingDraft.margin} onChange={(event) => setEditingDraft((current) => ({ ...current, margin: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Margen" />
                  </div>
                  <textarea value={editingDraft.note} onChange={(event) => setEditingDraft((current) => ({ ...current, note: event.target.value }))} className="min-h-24 w-full rounded-2xl border border-[var(--color-line)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Nota operativa" />
                  <div className="flex gap-3">
                    <button onClick={saveEdit} disabled={isPending || !editingDraft.vehicle.trim()} className="rounded-2xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-45">
                      Guardar
                    </button>
                    <button onClick={cancelEdit} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)]">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">{operation.type}</p>
                      <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-ink)]">{operation.vehicle}</h2>
                    </div>
                    <StatusBadge tone={operation.tone}>{operation.status}</StatusBadge>
                  </div>
                  <div className="mt-5 grid gap-3 text-sm text-[var(--color-muted)] sm:grid-cols-2">
                    <p>Comprador: {operation.buyer}</p>
                    <p>Vendedor: {operation.seller}</p>
                    <p>Fecha: {operation.date}</p>
                    <p>Precio: {operation.agreedPrice}</p>
                    <p>Costo: {operation.realCost}</p>
                    <p>Margen: {operation.margin}</p>
                  </div>
                  <p className="mt-4 rounded-2xl bg-[var(--color-panel-soft)] px-4 py-3 text-sm text-[var(--color-ink)]">{operation.note}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href={`/operaciones/${operation.id}`} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                      Abrir ficha
                    </Link>
                  {canEdit ? (
                      <>
                      <button onClick={() => startEditing(operation)} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                        Editar
                      </button>
                      </>
                  ) : null}
                  </div>
                </>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
