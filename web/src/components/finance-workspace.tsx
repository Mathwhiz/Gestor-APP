"use client";

import { useMemo, useState, useTransition } from "react";
import { PageHeader } from "@/components/page-header";
import { movements as mockMovements } from "@/data/mock-data";
import { createFinancialMovementAction, updateFinancialMovementAction } from "@/app/(app)/actions";
import { confirmDiscardChanges, useUnsavedChanges } from "@/hooks/use-unsaved-changes";

type MovementItem = (typeof mockMovements)[number];

const filters = ["Todos", "Ingresos", "Egresos", "Gestoria", "Agencia", "General", "Personal"] as const;

export function FinanceWorkspace({
  initialItems = mockMovements,
  canEdit,
}: {
  initialItems?: MovementItem[];
  canEdit: boolean;
}) {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Todos");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<MovementItem[]>(initialItems);
  const [draft, setDraft] = useState({
    description: "",
    category: "Otros ingresos",
    area: "Gestoria",
    account: "Caja gestoria",
    amount: "+ $ 0",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState({
    description: "",
    category: "",
    area: "Gestoria",
    account: "",
    amount: "",
  });
  const [editingInitial, setEditingInitial] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      items.filter((movement) => {
        const matchesSearch =
          !search ||
          `${movement.description} ${movement.category} ${movement.area} ${movement.account}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const movementType = movement.amount.startsWith("+") ? "Ingresos" : "Egresos";
        const matchesFilter =
          activeFilter === "Todos" ||
          activeFilter === movementType ||
          activeFilter === movement.area;
        return matchesSearch && matchesFilter;
      }),
    [activeFilter, items, search],
  );
  const hasDraftChanges = Boolean(
    draft.description.trim() ||
      draft.category !== "Otros ingresos" ||
      draft.area !== "Gestoria" ||
      draft.account !== "Caja gestoria" ||
      draft.amount !== "+ $ 0",
  );
  const hasEditChanges =
    editingId !== null &&
    JSON.stringify(editingDraft) !== editingInitial;

  useUnsavedChanges(hasDraftChanges || hasEditChanges);

  const balance = filtered.reduce((total: number, item: (typeof filtered)[number]) => {
    const numeric = Number(item.amount.replace(/[^\d-]/g, ""));
    return item.amount.startsWith("+") ? total + numeric : total - Math.abs(numeric);
  }, 0);

  function addMovement() {
    if (!canEdit || !draft.description.trim()) return;

    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await createFinancialMovementAction(draft);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) => [result.item, ...current]);
      setDraft({
        description: "",
        category: "Otros ingresos",
        area: "Gestoria",
        account: "Caja gestoria",
        amount: "+ $ 0",
      });
      setSuccess("Movimiento cargado.");
    });
  }

  function saveEdit() {
    if (!canEdit || !editingId) return;

    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await updateFinancialMovementAction({
        id: editingId,
        ...editingDraft,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) =>
        current.map((movement) => (movement.id === editingId ? result.item : movement)),
      );
      setEditingId(null);
      setEditingInitial("");
      setSuccess("Movimiento actualizado.");
    });
  }

  function resetDraft() {
    if (!confirmDiscardChanges(hasDraftChanges)) return;
    setDraft({
      description: "",
      category: "Otros ingresos",
      area: "Gestoria",
      account: "Caja gestoria",
      amount: "+ $ 0",
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
        eyebrow="Finanzas"
        title="Libro de movimientos"
        description="Caja diaria, gastos, cobros y separacion por area de negocio."
        actionLabel="Nuevo movimiento"
        actionDisabled={!canEdit}
      />

      <section className="grid gap-4 rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por descripcion, categoria, area o cuenta"
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

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Movimientos</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{filtered.length}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Balance filtro</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              {balance >= 0 ? "+ " : "- "}${Math.abs(balance).toLocaleString("es-AR")}
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Area activa</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{activeFilter}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Carga rapida de movimiento</p>
            {hasDraftChanges ? <p className="mt-1 text-sm text-[var(--color-warning,#b57628)]">Tenes cambios sin guardar en el alta.</p> : null}
          </div>
          {!canEdit ? <p className="text-sm text-[var(--color-muted)]">Tu rol solo puede consultar.</p> : null}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input value={draft.description} onChange={(event) => setDraft((c) => ({ ...c, description: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="Descripcion" disabled={!canEdit || isPending} />
          <select value={draft.category} onChange={(event) => setDraft((c) => ({ ...c, category: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" disabled={!canEdit || isPending}>
            <option>Otros ingresos</option>
            <option>Honorarios de tramites</option>
            <option>Aranceles</option>
            <option>Comisiones pagadas</option>
            <option>Alquiler</option>
          </select>
          <select value={draft.area} onChange={(event) => setDraft((c) => ({ ...c, area: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" disabled={!canEdit || isPending}>
            <option>Gestoria</option>
            <option>Agencia</option>
            <option>General</option>
            <option>Personal</option>
          </select>
          <input value={draft.amount} onChange={(event) => setDraft((c) => ({ ...c, amount: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="+ $ 0" disabled={!canEdit || isPending} />
          <button onClick={addMovement} disabled={!canEdit || isPending || !draft.description.trim()} className="h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-45">
            {isPending ? "Guardando..." : "Agregar"}
          </button>
          <button onClick={resetDraft} disabled={!canEdit || isPending} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-45">
            Limpiar
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p> : null}
        {success ? <p className="mt-3 text-sm text-[var(--color-success)]">{success}</p> : null}
      </section>

      <section className="rounded-[28px] border border-[var(--color-line)] bg-white">
        <div className="grid gap-3 p-4 sm:hidden">
          {filtered.map((movement) => {
            const isEditing = editingId === movement.id;

            return (
              <article key={movement.id} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">{movement.date}</p>
                {isEditing ? (
                  <div className="mt-3 space-y-3">
                    <input value={editingDraft.description} onChange={(event) => setEditingDraft((current) => ({ ...current, description: event.target.value }))} className="h-10 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]" />
                    <input value={editingDraft.category} onChange={(event) => setEditingDraft((current) => ({ ...current, category: event.target.value }))} className="h-10 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]" />
                    <select value={editingDraft.area} onChange={(event) => setEditingDraft((current) => ({ ...current, area: event.target.value }))} className="h-10 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]">
                      <option>Gestoria</option><option>Agencia</option><option>General</option><option>Personal</option>
                    </select>
                    <input value={editingDraft.account} onChange={(event) => setEditingDraft((current) => ({ ...current, account: event.target.value }))} className="h-10 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]" />
                    <input value={editingDraft.amount} onChange={(event) => setEditingDraft((current) => ({ ...current, amount: event.target.value }))} className="h-10 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]" />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} disabled={isPending || !editingDraft.description.trim()} className="rounded-xl bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-45">Guardar</button>
                      <button onClick={cancelEdit} className="rounded-xl border border-[var(--color-line)] px-3 py-2 text-xs text-[var(--color-muted)]">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-ink)]">{movement.description}</p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">{movement.category}</p>
                      </div>
                      <p className={`text-sm font-semibold ${movement.amount.startsWith("+") ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                        {movement.amount}
                      </p>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-[var(--color-muted)]">
                      <p>Area: {movement.area}</p>
                      <p>Cuenta: {movement.account}</p>
                    </div>
                    {canEdit ? (
                      <div className="mt-4">
                        <button onClick={() => {
                          setEditingId(movement.id);
                          const nextDraft = {
                            description: movement.description,
                            category: movement.category,
                            area: movement.area,
                            account: movement.account,
                            amount: movement.amount,
                          };
                          setEditingDraft(nextDraft);
                          setEditingInitial(JSON.stringify(nextDraft));
                        }} className="rounded-xl border border-[var(--color-line)] px-3 py-2 text-xs text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                          Editar
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </article>
            );
          })}
        </div>
        <div className="hidden overflow-x-auto sm:block">
        <table className="min-w-[860px] divide-y divide-[var(--color-line)] text-left">
          <thead className="bg-[var(--color-panel-soft)] text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            <tr>
              {["Fecha", "Descripcion", "Categoria", "Area", "Cuenta", "Importe", ""].map((heading) => (
                <th key={heading} className="px-5 py-4 font-medium">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {filtered.map((movement) => {
              const isEditing = editingId === movement.id;

              return (
                <tr key={movement.id} className="transition hover:bg-[var(--color-panel-soft)]">
                  <td className="px-5 py-4 font-mono text-sm text-[var(--color-muted)]">{movement.date}</td>
                  {isEditing ? (
                    <>
                      <td className="px-5 py-4"><input value={editingDraft.description} onChange={(event) => setEditingDraft((current) => ({ ...current, description: event.target.value }))} className="h-10 w-full rounded-xl border border-[var(--color-line)] px-3 text-sm outline-none focus:border-[var(--color-accent)]" /></td>
                      <td className="px-5 py-4"><input value={editingDraft.category} onChange={(event) => setEditingDraft((current) => ({ ...current, category: event.target.value }))} className="h-10 w-full rounded-xl border border-[var(--color-line)] px-3 text-sm outline-none focus:border-[var(--color-accent)]" /></td>
                      <td className="px-5 py-4"><select value={editingDraft.area} onChange={(event) => setEditingDraft((current) => ({ ...current, area: event.target.value }))} className="h-10 w-full rounded-xl border border-[var(--color-line)] px-3 text-sm outline-none focus:border-[var(--color-accent)]"><option>Gestoria</option><option>Agencia</option><option>General</option><option>Personal</option></select></td>
                      <td className="px-5 py-4"><input value={editingDraft.account} onChange={(event) => setEditingDraft((current) => ({ ...current, account: event.target.value }))} className="h-10 w-full rounded-xl border border-[var(--color-line)] px-3 text-sm outline-none focus:border-[var(--color-accent)]" /></td>
                      <td className="px-5 py-4"><input value={editingDraft.amount} onChange={(event) => setEditingDraft((current) => ({ ...current, amount: event.target.value }))} className="h-10 w-full rounded-xl border border-[var(--color-line)] px-3 text-sm outline-none focus:border-[var(--color-accent)]" /></td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button onClick={saveEdit} disabled={isPending || !editingDraft.description.trim()} className="rounded-xl bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-45">Guardar</button>
                          <button onClick={cancelEdit} className="rounded-xl border border-[var(--color-line)] px-3 py-2 text-xs text-[var(--color-muted)]">Cancelar</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-4 text-sm font-semibold text-[var(--color-ink)]">{movement.description}</td>
                      <td className="px-5 py-4 text-sm text-[var(--color-muted)]">{movement.category}</td>
                      <td className="px-5 py-4 text-sm text-[var(--color-muted)]">{movement.area}</td>
                      <td className="px-5 py-4 text-sm text-[var(--color-muted)]">{movement.account}</td>
                      <td className={`px-5 py-4 text-sm font-semibold ${movement.amount.startsWith("+") ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>{movement.amount}</td>
                      <td className="px-5 py-4">
                        {canEdit ? (
                          <button onClick={() => {
                            setEditingId(movement.id);
                            const nextDraft = {
                              description: movement.description,
                              category: movement.category,
                              area: movement.area,
                              account: movement.account,
                              amount: movement.amount,
                            };
                            setEditingDraft(nextDraft);
                            setEditingInitial(JSON.stringify(nextDraft));
                          }} className="rounded-xl border border-[var(--color-line)] px-3 py-2 text-xs text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                            Editar
                          </button>
                        ) : null}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </section>
    </div>
  );
}
