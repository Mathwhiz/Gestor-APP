"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { vehicles as mockVehicles } from "@/data/mock-data";
import {
  createVehicleAction,
  toggleVehicleArchivedAction,
  updateVehicleAction,
} from "@/app/(app)/actions";
import { confirmDiscardChanges, useUnsavedChanges } from "@/hooks/use-unsaved-changes";

type VehicleItem = (typeof mockVehicles)[number] & {
  archived?: boolean;
};

const filters = ["Todos", "Gestoria", "Agencia", "En tramite", "En stock", "Documentacion incompleta", "Archivados"] as const;

export function VehiclesWorkspace({
  initialItems = mockVehicles,
  canEdit,
}: {
  initialItems?: VehicleItem[];
  canEdit: boolean;
}) {
  const [items, setItems] = useState<VehicleItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Todos");
  const [showComposer, setShowComposer] = useState(false);
  const [draft, setDraft] = useState({
    plate: "",
    name: "",
    owner: "",
    area: "Gestoria",
    status: "En tramite",
    note: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState({
    plate: "",
    name: "",
    owner: "",
    area: "Gestoria",
    status: "En tramite",
    note: "",
  });
  const [editingInitial, setEditingInitial] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      items.filter((vehicle) => {
        const matchesSearch =
          !search ||
          `${vehicle.plate} ${vehicle.name} ${vehicle.owner} ${vehicle.note}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesFilter =
          activeFilter === "Todos"
            ? !vehicle.archived
            : activeFilter === "Archivados"
              ? Boolean(vehicle.archived)
              : !vehicle.archived &&
                (vehicle.area === activeFilter || vehicle.status === activeFilter);
        return matchesSearch && matchesFilter;
      }),
    [activeFilter, items, search],
  );
  const hasDraftChanges = Boolean(
    draft.plate.trim() ||
      draft.name.trim() ||
      draft.owner.trim() ||
      draft.area !== "Gestoria" ||
      draft.status !== "En tramite" ||
      draft.note.trim(),
  );
  const hasEditChanges =
    editingId !== null &&
    JSON.stringify(editingDraft) !== editingInitial;

  useUnsavedChanges((showComposer && hasDraftChanges) || hasEditChanges);

  function addVehicle() {
    if (!canEdit || !draft.plate.trim() || !draft.name.trim()) return;

    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await createVehicleAction(draft);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) => [result.item, ...current]);
      setDraft({
        plate: "",
        name: "",
        owner: "",
        area: "Gestoria",
        status: "En tramite",
        note: "",
      });
      setShowComposer(false);
      setSuccess("Vehiculo cargado.");
    });
  }

  function startEditing(vehicle: VehicleItem) {
    setError("");
    setSuccess("");
    setEditingId(vehicle.id);
    const nextDraft = {
      plate: vehicle.plate,
      name: vehicle.name,
      owner: vehicle.owner,
      area: vehicle.area,
      status: vehicle.status,
      note: vehicle.note === "Sin observaciones" ? "" : vehicle.note,
    };
    setEditingDraft(nextDraft);
    setEditingInitial(JSON.stringify(nextDraft));
  }

  function saveEdit() {
    if (!canEdit || !editingId) return;

    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await updateVehicleAction({
        id: editingId,
        ...editingDraft,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) =>
        current.map((vehicle) => (vehicle.id === editingId ? result.item : vehicle)),
      );
      setEditingId(null);
      setEditingInitial("");
      setSuccess("Vehiculo actualizado.");
    });
  }

  function toggleArchived(vehicle: VehicleItem) {
    if (!canEdit) return;

    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await toggleVehicleArchivedAction({
        id: vehicle.id,
        archived: Boolean(vehicle.archived),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === vehicle.id ? { ...item, archived: result.item.archived } : item,
        ),
      );
      setEditingId(null);
      setSuccess(vehicle.archived ? "Vehiculo reactivado." : "Vehiculo archivado.");
    });
  }

  function resetDraft() {
    if (!confirmDiscardChanges(hasDraftChanges)) return;
    setDraft({
      plate: "",
      name: "",
      owner: "",
      area: "Gestoria",
      status: "En tramite",
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
        eyebrow="Vehiculos"
        title="Parque y unidades"
        description="Vista unica para autos en tramite, stock de agencia y documentacion vinculada."
        actionLabel="Nuevo vehiculo"
        actionDisabled={!canEdit}
      />

      <section className="grid gap-4 rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por dominio, unidad, titular o nota" className="h-12 w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" />
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
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Unidades</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{items.filter((item) => !item.archived).length}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Stock</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{items.filter((item) => item.status === "En stock" && !item.archived).length}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">En tramite</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{items.filter((item) => item.status === "En tramite" && !item.archived).length}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Archivados</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{items.filter((item) => item.archived).length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Alta rapida de vehiculo</p>
            {showComposer ? <p className="mt-1 text-sm text-[var(--color-warning,#b57628)]">{hasDraftChanges ? "Tenes cambios sin guardar en el alta." : "Abri el alta solo cuando necesites cargar una unidad nueva."}</p> : null}
          </div>
          <div className="flex items-center gap-3">
            {!canEdit ? <p className="text-sm text-[var(--color-muted)]">Tu rol solo puede consultar.</p> : null}
            <button
              type="button"
              onClick={() => {
                if (showComposer && !confirmDiscardChanges(hasDraftChanges)) return;
                setShowComposer((current) => !current);
              }}
              disabled={!canEdit}
              className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {showComposer ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>
        {showComposer ? (
          <>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <input value={draft.plate} onChange={(event) => setDraft((current) => ({ ...current, plate: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="Dominio" disabled={!canEdit || isPending} />
              <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)] xl:col-span-2" placeholder="Unidad" disabled={!canEdit || isPending} />
              <input value={draft.owner} onChange={(event) => setDraft((current) => ({ ...current, owner: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="Titular" disabled={!canEdit || isPending} />
              <select value={draft.area} onChange={(event) => setDraft((current) => ({ ...current, area: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" disabled={!canEdit || isPending}>
                <option>Gestoria</option>
                <option>Agencia</option>
              </select>
              <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" disabled={!canEdit || isPending}>
                <option>En tramite</option>
                <option>En stock</option>
                <option>Documentacion incompleta</option>
              </select>
            </div>
            <textarea value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} className="mt-3 min-h-24 w-full rounded-2xl border border-[var(--color-line)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="Nota operativa" disabled={!canEdit || isPending} />
            <div className="mt-3 flex flex-wrap gap-3">
              <button onClick={addVehicle} disabled={!canEdit || isPending || !draft.plate.trim() || !draft.name.trim()} className="h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-45">
                {isPending ? "Guardando..." : "Agregar"}
              </button>
              <button onClick={resetDraft} disabled={!canEdit || isPending} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-45">
                Limpiar
              </button>
            </div>
          </>
        ) : null}
        {error ? <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p> : null}
        {success ? <p className="mt-3 text-sm text-[var(--color-success)]">{success}</p> : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((vehicle) => {
          const isEditing = editingId === vehicle.id;

          return (
            <article key={vehicle.id} className={`rounded-[28px] border px-5 py-5 ${vehicle.archived ? "border-[var(--color-line)] bg-[var(--color-panel-soft)] opacity-80" : "border-[var(--color-line)] bg-white"}`}>
              {isEditing ? (
                <div className="space-y-3">
                  {hasEditChanges ? <p className="text-sm text-[var(--color-warning,#b57628)]">Tenes cambios sin guardar en esta edicion.</p> : null}
                  <input value={editingDraft.plate} onChange={(event) => setEditingDraft((current) => ({ ...current, plate: event.target.value }))} className="h-11 w-full rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" />
                  <input value={editingDraft.name} onChange={(event) => setEditingDraft((current) => ({ ...current, name: event.target.value }))} className="h-11 w-full rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" />
                  <input value={editingDraft.owner} onChange={(event) => setEditingDraft((current) => ({ ...current, owner: event.target.value }))} className="h-11 w-full rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select value={editingDraft.area} onChange={(event) => setEditingDraft((current) => ({ ...current, area: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]">
                      <option>Gestoria</option>
                      <option>Agencia</option>
                    </select>
                    <select value={editingDraft.status} onChange={(event) => setEditingDraft((current) => ({ ...current, status: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]">
                      <option>En tramite</option>
                      <option>En stock</option>
                      <option>Documentacion incompleta</option>
                    </select>
                  </div>
                  <textarea value={editingDraft.note} onChange={(event) => setEditingDraft((current) => ({ ...current, note: event.target.value }))} className="min-h-24 w-full rounded-2xl border border-[var(--color-line)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Nota operativa" />
                  <div className="flex gap-3">
                    <button onClick={saveEdit} disabled={isPending || !editingDraft.plate.trim() || !editingDraft.name.trim()} className="rounded-2xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-45">Guardar</button>
                    <button onClick={cancelEdit} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)]">Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">{vehicle.plate}</p>
                      <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-ink)]">{vehicle.name}</h2>
                    </div>
                    <StatusBadge tone={vehicle.archived ? "neutral" : vehicle.tone}>{vehicle.archived ? "Archivado" : vehicle.status}</StatusBadge>
                  </div>
                  <div className="mt-5 grid gap-3 text-sm text-[var(--color-muted)]">
                    <p>Titular: {vehicle.owner}</p>
                    <p>Area: {vehicle.area}</p>
                    <p>Nota: {vehicle.note}</p>
                  </div>
                  {canEdit ? (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link href={`/vehiculos/${vehicle.id}`} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                        Abrir ficha
                      </Link>
                      {!vehicle.archived ? (
                        <button onClick={() => startEditing(vehicle)} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                          Editar
                        </button>
                      ) : null}
                      <button onClick={() => toggleArchived(vehicle)} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                        {vehicle.archived ? "Reactivar" : "Archivar"}
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
