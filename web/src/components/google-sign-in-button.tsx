"use client";

import Link from "next/link";

export function GoogleSignInButton({ next }: { next: string }) {
  return (
    <Link
      href={`/auth/login?next=${encodeURIComponent(next)}`}
      className="flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
    >
      Continuar con Google
    </Link>
  );
}
