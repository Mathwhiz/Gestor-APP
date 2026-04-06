type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actionLabel,
}: PageHeaderProps) {
  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)] sm:text-base">
          {description}
        </p>
      </div>

      {actionLabel ? (
        <button className="rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]">
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
