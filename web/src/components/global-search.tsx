"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SearchItem = {
  id: string;
  title: string;
  meta: string;
  href: string;
  kind: "tramite" | "contacto" | "vehiculo" | "operacion";
};

const kindLabel: Record<SearchItem["kind"], string> = {
  tramite: "Tramite",
  contacto: "Contacto",
  vehiculo: "Vehiculo",
  operacion: "Operacion",
};

export function GlobalSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return items
      .filter((item) =>
        `${item.title} ${item.meta} ${kindLabel[item.kind]}`
          .toLowerCase()
          .includes(normalized),
      )
      .slice(0, 8);
  }, [items, query]);

  return (
    <div className="relative">
      <button
        className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        Buscar
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-3 w-[min(92vw,28rem)] rounded-[28px] border border-[var(--color-line)] bg-white p-4 shadow-[0_24px_80px_rgba(17,24,39,0.12)]">
          <input
            autoFocus
            className="h-12 w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar tramites, contactos, vehiculos u operaciones"
            value={query}
          />

          <div className="mt-3 space-y-2">
            {!query.trim() ? (
              <p className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
                Escribi algo para buscar en toda la base.
              </p>
            ) : results.length === 0 ? (
              <p className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
                No hubo resultados.
              </p>
            ) : (
              results.map((item) => (
                <Link
                  key={`${item.kind}-${item.id}`}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl border border-[var(--color-line)] px-4 py-3 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{item.title}</p>
                    <span className="rounded-full bg-[var(--color-panel-soft)] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      {kindLabel[item.kind]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{item.meta}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
