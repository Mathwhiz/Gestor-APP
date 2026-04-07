import { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-[24px] border border-[var(--color-line)] bg-white px-4 py-4 sm:rounded-[28px] sm:px-6 sm:py-5">
      <div className="mb-4 sm:mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)] sm:text-xl">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
