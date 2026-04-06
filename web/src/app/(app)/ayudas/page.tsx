import { PageHeader } from "@/components/page-header";
import { guides } from "@/data/mock-data";
import { StatusBadge } from "@/components/status-badge";

export default function GuidesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Ayudas"
        title="Centro de guias"
        description="Recordatorios, requisitos y links utiles para tramites frecuentes."
        actionLabel="Nueva guia"
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {guides.map((guide) => (
          <article
            key={guide.id}
            className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                  {guide.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                  {guide.summary}
                </p>
              </div>
              <StatusBadge tone="neutral">{guide.scope}</StatusBadge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
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
                  key={highlight}
                  className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-3 text-sm text-[var(--color-ink)]"
                >
                  {highlight}
                </p>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
