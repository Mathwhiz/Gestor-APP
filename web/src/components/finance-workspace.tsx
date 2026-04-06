"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { movements as seedMovements } from "@/data/mock-data";

type MovementItem = (typeof seedMovements)[number];

const filters = ["Todos", "Ingresos", "Egresos", "Gestoria", "Agencia", "General", "Personal"] as const;

export function FinanceWorkspace() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Todos");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<MovementItem[]>(seedMovements);
  const [draft, setDraft] = useState({
    description: "",
    category: "Otros ingresos",
    area: "Gestoria",
    account: "Caja gestoria",
    amount: "+ $ 0",
  });

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

  const balance = filtered.reduce((total, item) => {
    const numeric = Number(item.amount.replace(/[^\d-]/g, ""));
    return item.amount.startsWith("+") ? total + numeric : total - Math.abs(numeric);
  }, 0);

  function addMovement() {
    if (!draft.description.trim()) return;
    setItems((current) => [
      {
        id: `mov-${Date.now()}`,
        date: "06/04/2026",
        description: draft.description,
        category: draft.category,
        area: draft.area,
        account: draft.account,
        amount: draft.amount,
      },
      ...current,
    ]);
    setDraft({
      description: "",
      category: "Otros ingresos",
      area: "Gestoria",
      account: "Caja gestoria",
      amount: "+ $ 0",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Finanzas"
        title="Libro de movimientos"
        description="Caja diaria, gastos, cobros y separacion por area de negocio."
        actionLabel="Nuevo movimiento"
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
        <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Carga rapida de movimiento</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input value={draft.description} onChange={(event) => setDraft((c) => ({ ...c, description: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Descripcion" />
          <select value={draft.category} onChange={(event) => setDraft((c) => ({ ...c, category: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]">
            <option>Otros ingresos</option>
            <option>Honorarios de tramites</option>
            <option>Aranceles</option>
            <option>Comisiones pagadas</option>
            <option>Alquiler</option>
          </select>
          <select value={draft.area} onChange={(event) => setDraft((c) => ({ ...c, area: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]">
            <option>Gestoria</option>
            <option>Agencia</option>
            <option>General</option>
            <option>Personal</option>
          </select>
          <input value={draft.amount} onChange={(event) => setDraft((c) => ({ ...c, amount: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="+ $ 0" />
          <button onClick={addMovement} className="h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]">
            Agregar
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-white">
        <table className="min-w-full divide-y divide-[var(--color-line)] text-left">
          <thead className="bg-[var(--color-panel-soft)] text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            <tr>
              {["Fecha", "Descripcion", "Categoria", "Area", "Cuenta", "Importe"].map((heading) => (
                <th key={heading} className="px-5 py-4 font-medium">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {filtered.map((movement) => (
              <tr key={movement.id} className="transition hover:bg-[var(--color-panel-soft)]">
                <td className="px-5 py-4 font-mono text-sm text-[var(--color-muted)]">{movement.date}</td>
                <td className="px-5 py-4 text-sm font-semibold text-[var(--color-ink)]">{movement.description}</td>
                <td className="px-5 py-4 text-sm text-[var(--color-muted)]">{movement.category}</td>
                <td className="px-5 py-4 text-sm text-[var(--color-muted)]">{movement.area}</td>
                <td className="px-5 py-4 text-sm text-[var(--color-muted)]">{movement.account}</td>
                <td className={`px-5 py-4 text-sm font-semibold ${movement.amount.startsWith("+") ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                  {movement.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
