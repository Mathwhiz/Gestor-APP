import Link from "next/link";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionDisabled?: boolean;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  actionDisabled = false,
}: PageHeaderProps) {
  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">{eyebrow}</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)] sm:text-base sm:leading-7">
          {description}
        </p>
      </div>

      {actionLabel ? (
        actionHref && !actionDisabled ? (
          <Link
            href={actionHref}
            className="w-full rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] sm:w-auto"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            className="w-full rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
            disabled={actionDisabled}
          >
            {actionLabel}
          </button>
        )
      ) : null}
    </section>
  );
}
