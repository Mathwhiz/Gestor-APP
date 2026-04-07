"use client";

import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function GoogleSignInButton({ next }: { next: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError("");

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
        const { error: authError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo },
        });

        if (authError) {
          setError("No se pudo iniciar el acceso con Google.");
        }
      } catch {
        setError("No se pudo iniciar el acceso con Google.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Abriendo Google..." : "Continuar con Google"}
      </button>

      {error ? (
        <div className="rounded-2xl border border-[rgba(173,95,71,0.26)] bg-[rgba(173,95,71,0.08)] px-4 py-3 text-sm text-[var(--color-ink)]">
          {error}
        </div>
      ) : null}
    </div>
  );
}
