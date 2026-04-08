"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { ProcedureDetail } from "@/data/mock-data";
import {
  addProcedureMovementAction,
  addProcedureNoteAction,
  toggleProcedureRequirementAction,
  updateProcedureStatusAction,
} from "@/app/(app)/actions";

const statusOptions = [
  { label: "Pendiente de documentacion", tone: "warning" as const },
  { label: "Listo para presentar", tone: "info" as const },
  { label: "Presentado", tone: "info" as const },
  { label: "Observado", tone: "danger" as const },
  { label: "Terminado", tone: "success" as const },
];

type WorkspaceProps = {
  detail: ProcedureDetail;
  canEdit: boolean;
};

export function ProcedureDetailWorkspace({ detail, canEdit }: WorkspaceProps) {
  const initialStatus =
    detail.summary.find((item) => item.label === "Estado")?.value ?? "Pendiente de documentacion";
  const initialPriority =
    detail.summary.find((item) => item.label === "Prioridad")?.value ?? "Media";

  const [status, setStatus] = useState(initialStatus);
  const [requirements, setRequirements] = useState(detail.requirements);
  const [timeline, setTimeline] = useState(detail.timeline);
  const [notes, setNotes] = useState(detail.notes);
  const [movements, setMovements] = useState(detail.movements);
  const [noteDraft, setNoteDraft] = useState("");
  const [movementDraft, setMovementDraft] = useState({
    label: "",
    meta: "Gasto manual - Caja gestoria",
    amount: "- $ 0",
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const statusTone = useMemo(
    () => statusOptions.find((item) => item.label === status)?.tone ?? "neutral",
    [status],
  );

  const completedRequirements = requirements.filter((item) => item.done).length;
  const pendingRequirements = requirements.filter((item) => !item.done);
  const positiveMovements = movements.filter((item) => item.amount.startsWith("+"));
  const negativeMovements = movements.filter((item) => item.amount.startsWith("-"));
  const riskLabel =
    pendingRequirements.length > 0
      ? `${pendingRequirements.length} requisito${pendingRequirements.length === 1 ? "" : "s"} pendiente${pendingRequirements.length === 1 ? "" : "s"}`
      : status === "Observado"
        ? "Observacion abierta"
        : "Sin bloqueo critico";
  const actionCards = [
    {
      title: "Ir al checklist",
      description: "Cerrar documentacion antes de cambiar el estado operativo.",
      href: "#checklist",
      external: false,
    },
    {
      title: "Registrar movimiento",
      description: "Cargar cobro o gasto vinculado a esta carpeta.",
      href: "#caja",
      external: false,
    },
    {
      title: "Dejar nota operativa",
      description: "Registrar criterio interno o decision tomada.",
      href: "#notas",
      external: false,
    },
    {
      title: "Abrir ayuda del tramite",
      description: "Consultar guia base y referencias de jurisdiccion.",
      href: "/ayudas",
      external: true,
    },
  ];

  function toggleRequirement(label: string) {
    if (!canEdit) return;

    setError("");
    startTransition(async () => {
      const result = await toggleProcedureRequirementAction({ id: detail.id, label });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setRequirements((current) =>
        current.map((item) =>
          item.label === label ? { ...item, done: result.item.done } : item,
        ),
      );
      setTimeline((current) => [result.item.timelineItem, ...current]);
    });
  }

  function changeStatus(nextStatus: string) {
    if (!canEdit) return;

    setError("");
    setStatus(nextStatus);
    startTransition(async () => {
      const result = await updateProcedureStatusAction({ id: detail.id, status: nextStatus });
      if (!result.ok) {
        setError(result.error);
        setStatus(initialStatus);
        return;
      }
      setTimeline((current) => [result.item, ...current]);
    });
  }

  function addNote() {
    if (!canEdit || !noteDraft.trim()) return;

    setError("");
    startTransition(async () => {
      const result = await addProcedureNoteAction({ id: detail.id, note: noteDraft });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setNotes((current) => [result.item, ...current]);
      setTimeline((current) => [result.timelineItem, ...current]);
      setNoteDraft("");
    });
  }

  function addMovement() {
    if (!canEdit || !movementDraft.label.trim()) return;

    setError("");
    startTransition(async () => {
      const result = await addProcedureMovementAction({
        id: detail.id,
        label: movementDraft.label,
        meta: movementDraft.meta,
        amount: movementDraft.amount,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMovements((current) => [result.item, ...current]);
      setTimeline((current) => [result.item.timelineItem, ...current]);
      setMovementDraft({
        label: "",
        meta: "Gasto manual - Caja gestoria",
        amount: "- $ 0",
      });
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Ficha de tramite"
        title={detail.title}
        description={`${detail.client} - ${detail.vehicle} - ${detail.registry}`}
        actionLabel="Actualizar estado"
        actionDisabled={!canEdit}
      />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(135deg,#f4eee4_0%,#fbf8f2_100%)] px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Estado del expediente
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            La carpeta esta avanzada, pero no deberia presentarse hasta cerrar la firma
            certificada y terminar la validacion previa.
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Cliente confirmado",
              "Verificacion hecha",
              `${completedRequirements}/${requirements.length} requisitos`,
              initialPriority,
              detail.templateName ?? "Plantilla base",
            ].map((pill) => (
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
              Estado actual
            </p>
            <div className="mt-3">
              <StatusBadge tone={statusTone}>{status}</StatusBadge>
            </div>
          </div>
          <div className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Responsable
            </p>
            <p className="mt-3 text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              Marcelo
            </p>
          </div>
          <div className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Riesgo
            </p>
            <p className="mt-3 text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              {riskLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Alertas operativas
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Pendientes</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                {pendingRequirements.length}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Ingresos</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                {positiveMovements.length}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Egresos</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                {negativeMovements.length}
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {(detail.alerts?.length ?? 0) > 0 ? (
              detail.alerts?.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-2xl border px-4 py-3 ${
                    item.tone === "danger"
                      ? "border-[rgba(173,95,71,0.22)] bg-[var(--color-danger-soft)]"
                      : item.tone === "warning"
                        ? "border-[rgba(181,118,40,0.22)] bg-[rgba(245,234,212,0.65)]"
                        : "border-[rgba(31,79,95,0.16)] bg-[rgba(228,238,241,0.8)]"
                  }`}
                >
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{item.title}</p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{item.detail}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-[rgba(43,111,85,0.22)] bg-[var(--color-success-soft)] px-4 py-3">
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  No hay bloqueos documentales visibles ahora.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3">
          {actionCards.map((item) =>
            item.external ? (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-[24px] border border-[var(--color-line)] bg-white px-5 py-5 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
              >
                <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
              </Link>
            ) : (
              <a
                key={item.title}
                href={item.href}
                className="rounded-[24px] border border-[var(--color-line)] bg-white px-5 py-5 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
              >
                <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
              </a>
            ),
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {detail.summary.map((item) => (
          <div
            key={item.label}
            className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {item.label}
            </p>
            <div className="mt-3">
              {item.label === "Estado" ? (
                <StatusBadge tone={statusTone}>{status}</StatusBadge>
              ) : item.tone ? (
                <StatusBadge tone={item.tone}>{item.value}</StatusBadge>
              ) : (
                <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                  {item.value}
                </p>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <SectionCard title="Checklist documental" description="Estado real del expediente.">
            <div id="checklist" />
            <div className="mb-4 rounded-2xl bg-[var(--color-panel-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
              Plantilla aplicada: <span className="font-semibold text-[var(--color-ink)]">{detail.templateName ?? "Base"}</span>.
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => changeStatus(option.label)}
                  disabled={!canEdit || isPending}
                  className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.14em] transition ${
                    option.label === status
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                      : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  } disabled:cursor-not-allowed disabled:opacity-45`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {requirements.map((item) => (
                <button
                  key={item.label}
                  onClick={() => toggleRequirement(item.label)}
                  disabled={!canEdit || isPending}
                  className="flex w-full items-center justify-between rounded-2xl border border-[var(--color-line)] px-4 py-3 text-left transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{item.label}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{item.note}</p>
                  </div>
                  <StatusBadge tone={item.done ? "success" : "warning"}>
                    {item.done ? "Recibido" : "Pendiente"}
                  </StatusBadge>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Historial y seguimiento" description="Movimientos recientes del tramite.">
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={event.title} className="flex gap-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-[var(--color-accent)]" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{event.title}</p>
                    <p className="text-sm text-[var(--color-muted)]">{event.description}</p>
                    <p className="font-mono text-xs text-[var(--color-muted)]">{event.date}</p>
                    {index === 0 ? (
                      <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-accent)]">
                        Ultimo movimiento
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Caja vinculada" description="Gastos e ingresos relacionados.">
            <div id="caja" />
            <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_180px_180px]">
              <input
                value={movementDraft.label}
                onChange={(event) =>
                  setMovementDraft((current) => ({ ...current, label: event.target.value }))
                }
                className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
                placeholder="Concepto"
                disabled={!canEdit || isPending}
              />
              <input
                value={movementDraft.meta}
                onChange={(event) =>
                  setMovementDraft((current) => ({ ...current, meta: event.target.value }))
                }
                className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
                placeholder="Meta / caja"
                disabled={!canEdit || isPending}
              />
              <input
                value={movementDraft.amount}
                onChange={(event) =>
                  setMovementDraft((current) => ({ ...current, amount: event.target.value }))
                }
                className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
                placeholder="- $ 0"
                disabled={!canEdit || isPending}
              />
              <button
                onClick={addMovement}
                disabled={!canEdit || isPending}
                className="h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Agregar movimiento
              </button>
            </div>

            <div className="space-y-3">
              {movements.map((movement) => (
                <div
                  key={`${movement.label}-${movement.amount}`}
                  className="flex items-center justify-between rounded-2xl border border-[var(--color-line)] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{movement.label}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{movement.meta}</p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      movement.amount.startsWith("+")
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-danger)]"
                    }`}
                  >
                    {movement.amount}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Acciones sugeridas" description="Acciones rapidas sobre este tramite.">
            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="#checklist"
                className="rounded-2xl border border-[var(--color-line)] px-4 py-4 text-left text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
              >
                Marcar requisito recibido
              </a>
              <a
                href="#caja"
                className="rounded-2xl border border-[var(--color-line)] px-4 py-4 text-left text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
              >
                Cargar gasto
              </a>
              <a
                href="#notas"
                className="rounded-2xl border border-[var(--color-line)] px-4 py-4 text-left text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
              >
                Agregar nota
              </a>
              <Link
                href="/ayudas"
                className="rounded-2xl border border-[var(--color-line)] px-4 py-4 text-left text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
              >
                Abrir guia
              </Link>
            </div>
          </SectionCard>

          <SectionCard title="Ayuda contextual" description="Guia rapida para este tramite.">
            <div className="space-y-4">
              <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
                <p className="text-sm font-semibold text-[var(--color-ink)]">{detail.guide.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                  {detail.guide.summary}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Pasos sugeridos
                </p>
                {detail.guide.steps.map((step, index) => (
                  <div
                    key={step}
                    className="flex gap-3 rounded-2xl border border-[var(--color-line)] px-4 py-3"
                  >
                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)]/12 text-xs font-semibold text-[var(--color-accent)]">
                      {index + 1}
                    </span>
                    <p className="text-sm text-[var(--color-ink)]">{step}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Links utiles
                </p>
                {detail.guide.links.map((link) => (
                  <div
                    key={link.label}
                    className="rounded-2xl border border-[var(--color-line)] px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{link.label}</p>
                    {link.href.startsWith("/") ? (
                      <Link
                        href={link.href}
                        className="mt-1 block font-mono text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)]"
                      >
                        {link.href}
                      </Link>
                    ) : (
                      <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">{link.href}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Notas operativas" description="Criterios internos y observaciones.">
            <div id="notas" />
            <div className="mb-4 space-y-3">
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                className="min-h-28 w-full rounded-2xl border border-[var(--color-line)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]"
                placeholder="Agregar nota operativa"
                disabled={!canEdit || isPending}
              />
              <button
                onClick={addNote}
                disabled={!canEdit || isPending}
                className="rounded-2xl bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Guardar nota
              </button>
            </div>
            {error ? <p className="mb-3 text-sm text-[var(--color-danger)]">{error}</p> : null}
            <div className="space-y-3 text-sm leading-6 text-[var(--color-muted)]">
              {notes.map((note) => (
                <p key={note} className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-3">
                  {note}
                </p>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
