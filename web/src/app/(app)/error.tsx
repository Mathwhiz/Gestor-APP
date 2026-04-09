"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error.message, error.digest, error.stack);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">Error del servidor</p>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
          Algo salió mal
        </h2>
        <p className="max-w-sm text-sm leading-6 text-[var(--color-muted)]">
          {error.digest ? `ID: ${error.digest}` : "Ocurrió un error inesperado al cargar esta página."}
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Reintentar
      </button>
    </div>
  );
}
