type SummaryCardProps = {
  title: string;
  value: string;
  detail: string;
  accent: string;
};

export function SummaryCard({ title, value, detail, accent }: SummaryCardProps) {
  return (
    <article className="rounded-[24px] border border-[var(--color-line)] bg-white px-4 py-4 sm:rounded-[28px] sm:px-5 sm:py-5">
      <div className="mb-4 h-2 w-14 rounded-full sm:mb-5 sm:w-16" style={{ backgroundColor: accent }} />
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">{title}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{detail}</p>
    </article>
  );
}
