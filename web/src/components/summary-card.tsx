type SummaryCardProps = {
  title: string;
  value: string;
  detail: string;
  accent: string;
};

export function SummaryCard({ title, value, detail, accent }: SummaryCardProps) {
  return (
    <article className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
      <div className="mb-5 h-2 w-16 rounded-full" style={{ backgroundColor: accent }} />
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{detail}</p>
    </article>
  );
}
