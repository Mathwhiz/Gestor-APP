import { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5 sm:px-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
