"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { guides as mockGuides } from "@/data/mock-data";
import {
  createGuideAction,
  toggleGuideArchivedAction,
  updateGuideAction,
} from "@/app/(app)/actions";

type GuideItem = (typeof mockGuides)[number] & {
  archived?: boolean;
};

const scopeFilters = ["Todas", "Base", "Interna", "Archivadas"] as const;

const operationPlaybooks = [
  {
    title: "Alta de carpeta nueva",
    detail: "Arrancar por contacto, vehiculo, tipo de tramite y fecha objetivo para no dejar seguimiento afuera desde el primer dia.",
    href: "/tramites?create=1",
    cta: "Abrir tramite",
  },
  {
    title: "Revisar observados del dia",
    detail: "Cruzar pendientes, pedir faltantes y dejar trazabilidad antes de mover otra carpeta.",
    href: "/dashboard",
    cta: "Ver dashboard",
  },
  {
    title: "Cerrar caja con contexto",
    detail: "Controlar cobros, gastos y criterio de imputacion antes de cerrar el dia operativo.",
    href: "/finanzas",
    cta: "Ir a finanzas",
  },
];

const emptyDraft = {
  title: "",
  summary: "",
  scope: "Base",
  jurisdiction: "Nacional",
  highlightsText: "",
};

function normalizeHighlights(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function GuidesWorkspace({
  initialItems = mockGuides,
  canEdit,
}: {
  initialItems?: GuideItem[];
  canEdit: boolean;
}) {
  const [items, setItems] = useState<GuideItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof scopeFilters)[number]>("Todas");
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState(emptyDraft);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const visibleItems = useMemo(
    () =>
      items.filter((guide) => {
        const matchesSearch =
          !search ||
          `${guide.title} ${guide.summary} ${guide.jurisdiction} ${guide.highlights.join(" ")}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesFilter =
          activeFilter === "Todas"
            ? !guide.archived
            : activeFilter === "Archivadas"
              ? Boolean(guide.archived)
              : !guide.archived && guide.scope === activeFilter;

        return matchesSearch && matchesFilter;
      }),
    [activeFilter, items, search],
  );
  const activeItems = items.filter((item) => !item.archived);
  const internalItems = activeItems.filter((item) => item.scope === "Interna");
  const recentItems = activeItems.slice(0, 3);

  function addGuide() {
    if (!canEdit) return;

    setError("");
    startTransition(async () => {
      const result = await createGuideAction({
        title: draft.title,
        summary: draft.summary,
        scope: draft.scope,
        jurisdiction: draft.jurisdiction,
        highlights: normalizeHighlights(draft.highlightsText),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) => [result.item, ...current]);
      setDraft(emptyDraft);
      setActiveFilter(result.item.scope === "Interna" ? "Interna" : "Todas");
    });
  }

  function startEditing(guide: GuideItem) {
    setEditingId(guide.id);
    setEditingDraft({
      title: guide.title,
      summary: guide.summary,
      scope: guide.scope,
      jurisdiction: guide.jurisdiction,
      highlightsText: guide.highlights.join("\n"),
    });
  }

  function saveEdit() {
    if (!canEdit || !editingId) return;

    setError("");
    startTransition(async () => {
      const result = await updateGuideAction({
        id: editingId,
        title: editingDraft.title,
        summary: editingDraft.summary,
        scope: editingDraft.scope,
        jurisdiction: editingDraft.jurisdiction,
        highlights: normalizeHighlights(editingDraft.highlightsText),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) =>
        current.map((guide) => (guide.id === editingId ? result.item : guide)),
      );
      setEditingId(null);
    });
  }

  function toggleArchived(guide: GuideItem) {
    if (!canEdit) return;

    setError("");
    startTransition(async () => {
      const result = await toggleGuideArchivedAction({
        id: guide.id,
        archived: Boolean(guide.archived),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === guide.id ? { ...item, archived: result.item.archived } : item,
        ),
      );
      setEditingId(null);
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Ayudas"
        title="Centro de guias"
        description="Recordatorios, requisitos y criterios internos para no improvisar tramites frecuentes."
        actionLabel="Nueva guia"
        actionDisabled={!canEdit}
      />

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(135deg,#f2e4cf_0%,#f7efe3_55%,#fffaf3_100%)] px-5 py-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Como usar esta base
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Ayudas para decidir mas rapido, no solo para guardar texto.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            Mezcla guias base para tramites repetidos con criterios internos del estudio. La idea es
            resolver dudas de mostrador, observaciones y cierre diario sin salir del sistema.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Base activa</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                {activeItems.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Criterios internos</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                {internalItems.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Ultimas visibles</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                {recentItems.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {operationPlaybooks.map((playbook) => (
            <Link
              key={playbook.title}
              href={playbook.href}
              className="rounded-[24px] border border-[var(--color-line)] bg-white px-5 py-5 transition hover:border-[var(--color-accent)] hover:shadow-[0_18px_40px_rgba(23,52,63,0.08)]"
            >
              <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                {playbook.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{playbook.detail}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--color-accent)]">
                {playbook.cta}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por tramite, alcance, jurisdiccion o criterio"
            className="h-12 w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <div className="flex flex-wrap gap-3">
            {scopeFilters.map((filter) => (
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
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Activas</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              {items.filter((item) => !item.archived).length}
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Internas</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              {items.filter((item) => !item.archived && item.scope === "Interna").length}
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Archivadas</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              {items.filter((item) => item.archived).length}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
            Alta rapida de guia
          </p>
          {!canEdit ? (
            <p className="text-sm text-[var(--color-muted)]">Tu rol solo puede consultar.</p>
          ) : null}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]"
            placeholder="Titulo"
            disabled={!canEdit || isPending}
          />
          <select
            value={draft.scope}
            onChange={(event) => setDraft((current) => ({ ...current, scope: event.target.value }))}
            className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]"
            disabled={!canEdit || isPending}
          >
            <option>Base</option>
            <option>Interna</option>
          </select>
          <input
            value={draft.jurisdiction}
            onChange={(event) =>
              setDraft((current) => ({ ...current, jurisdiction: event.target.value }))
            }
            className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]"
            placeholder="Jurisdiccion"
            disabled={!canEdit || isPending}
          />
          <input
            value={draft.summary}
            onChange={(event) =>
              setDraft((current) => ({ ...current, summary: event.target.value }))
            }
            className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)] md:col-span-2 xl:col-span-1"
            placeholder="Resumen corto"
            disabled={!canEdit || isPending}
          />
        </div>
        <textarea
          value={draft.highlightsText}
          onChange={(event) =>
            setDraft((current) => ({ ...current, highlightsText: event.target.value }))
          }
          className="mt-3 min-h-28 w-full rounded-2xl border border-[var(--color-line)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]"
          placeholder="Un punto por linea para la checklist o criterio interno"
          disabled={!canEdit || isPending}
        />
        <button
          onClick={addGuide}
          disabled={!canEdit || isPending}
          className="mt-3 h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isPending ? "Guardando..." : "Agregar"}
        </button>
        {error ? <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p> : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {visibleItems.length === 0 ? (
          <div className="lg:col-span-2 rounded-[28px] border border-dashed border-[var(--color-line)] bg-white px-6 py-10 text-center">
            <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              No hay guias para este filtro
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
              Proba con otra busqueda, cambia el alcance o carga una guia base para que el equipo no
              resuelva de memoria.
            </p>
          </div>
        ) : null}
        {visibleItems.map((guide) => {
          const isEditing = editingId === guide.id;

          return (
            <article
              key={guide.id}
              className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    value={editingDraft.title}
                    onChange={(event) =>
                      setEditingDraft((current) => ({ ...current, title: event.target.value }))
                    }
                    className="h-11 w-full rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
                  />
                  <input
                    value={editingDraft.summary}
                    onChange={(event) =>
                      setEditingDraft((current) => ({ ...current, summary: event.target.value }))
                    }
                    className="h-11 w-full rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      value={editingDraft.scope}
                      onChange={(event) =>
                        setEditingDraft((current) => ({ ...current, scope: event.target.value }))
                      }
                      className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
                    >
                      <option>Base</option>
                      <option>Interna</option>
                    </select>
                    <input
                      value={editingDraft.jurisdiction}
                      onChange={(event) =>
                        setEditingDraft((current) => ({
                          ...current,
                          jurisdiction: event.target.value,
                        }))
                      }
                      className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                  <textarea
                    value={editingDraft.highlightsText}
                    onChange={(event) =>
                      setEditingDraft((current) => ({
                        ...current,
                        highlightsText: event.target.value,
                      }))
                    }
                    className="min-h-28 w-full rounded-2xl border border-[var(--color-line)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={saveEdit}
                      disabled={isPending}
                      className="rounded-2xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-45"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                        {guide.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                        {guide.summary}
                      </p>
                    </div>
                    <StatusBadge tone={guide.archived ? "neutral" : "info"}>
                      {guide.archived ? "Archivada" : guide.scope}
                    </StatusBadge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    {!guide.archived ? (
                      <span className="rounded-full bg-[var(--color-panel-soft)] px-3 py-1">
                        {guide.scope}
                      </span>
                    ) : null}
                    <span className="rounded-full bg-[var(--color-panel-soft)] px-3 py-1">
                      {guide.jurisdiction}
                    </span>
                    <span className="rounded-full bg-[var(--color-panel-soft)] px-3 py-1">
                      {guide.lastUpdate}
                    </span>
                  </div>
                  <div className="mt-5 space-y-2">
                    {guide.highlights.map((highlight) => (
                      <p
                        key={`${guide.id}-${highlight}`}
                        className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-3 text-sm text-[var(--color-ink)]"
                      >
                        {highlight}
                      </p>
                    ))}
                  </div>
                  {canEdit ? (
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => startEditing(guide)}
                        className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleArchived(guide)}
                        className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                      >
                        {guide.archived ? "Reactivar" : "Archivar"}
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
