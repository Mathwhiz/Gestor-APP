type StatusBadgeProps = {
  tone: "success" | "warning" | "danger" | "neutral" | "info";
  children: React.ReactNode;
};

const toneClasses: Record<StatusBadgeProps["tone"], string> = {
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning-strong)]",
  danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  neutral: "bg-[var(--color-panel-soft)] text-[var(--color-muted)]",
  info: "bg-[var(--color-info-soft)] text-[var(--color-accent)]",
};

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
