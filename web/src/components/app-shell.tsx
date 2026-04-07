"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { GlobalSearch } from "@/components/global-search";
import { SignOutButton } from "@/components/sign-out-button";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tramites", label: "Tramites" },
  { href: "/contactos", label: "Contactos" },
  { href: "/vehiculos", label: "Vehiculos" },
  { href: "/operaciones", label: "Operaciones" },
  { href: "/finanzas", label: "Finanzas" },
  { href: "/ayudas", label: "Ayudas" },
  { href: "/tareas", label: "Tareas" },
];

export function AppShell({
  children,
  role,
  userLabel,
  searchItems,
}: {
  children: ReactNode;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  userLabel: string;
  searchItems: {
    id: string;
    title: string;
    meta: string;
    href: string;
    kind: "tramite" | "contacto" | "vehiculo" | "operacion";
  }[];
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#efe7da_0%,#f6f3ec_35%,#f3efe6_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 lg:flex-row lg:gap-4 lg:px-5">
        <aside className="mb-4 flex shrink-0 flex-col rounded-[32px] border border-[var(--color-line)] bg-[linear-gradient(180deg,#17343f_0%,#132b34_100%)] px-5 py-5 text-white shadow-[0_24px_70px_rgba(23,52,63,0.18)] lg:mb-0 lg:w-[280px] lg:px-6">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.22em] text-white/55">Gestor App</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Operacion diaria</h1>
            <p className="mt-3 text-sm leading-6 text-white/68">
              Gestoria, agencia y ayudas de tramites en una misma base.
            </p>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-white text-[#17343f] shadow-[0_12px_30px_rgba(255,255,255,0.12)]"
                    : "text-white/76 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "bg-[var(--color-accent)]"
                      : "bg-white/18"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-3 pt-8">
            <div className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Usuario activo</p>
              <p className="mt-2 text-sm font-semibold text-white">{userLabel}</p>
              <p className="mt-2 text-sm leading-6 text-white/68">Rol interno: {role}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Jurisdiccion base</p>
              <p className="mt-2 text-sm font-semibold text-white">La Pampa</p>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Con criterios editables para tramites nacionales y provinciales.
              </p>
            </div>
            <SignOutButton />
          </div>
        </aside>

        <div className="flex-1 rounded-[32px] border border-[var(--color-line)] bg-white/86 backdrop-blur">
          <header className="flex flex-col gap-4 border-b border-[var(--color-line)] px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Operacion autenticada
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Base conectada en Supabase con acceso listo para usuarios reales.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Base: La Pampa", "Auth: Google", `Rol: ${role}`].map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full bg-[var(--color-panel-soft)] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <GlobalSearch items={searchItems} />
              <button className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]">
                Nuevo
              </button>
            </div>
          </header>

          <main className="px-5 py-6 sm:px-8 sm:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
