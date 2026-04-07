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
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-3 py-3 lg:flex-row lg:gap-4 lg:px-5 lg:py-4">
        <aside className="mb-3 flex shrink-0 flex-col rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(180deg,#17343f_0%,#132b34_100%)] px-4 py-4 text-white shadow-[0_24px_70px_rgba(23,52,63,0.18)] lg:mb-0 lg:w-[280px] lg:rounded-[32px] lg:px-6 lg:py-5">
          <div className="mb-5 lg:mb-8">
            <p className="text-xs uppercase tracking-[0.22em] text-white/55">Gestor App</p>
            <div className="mt-3 flex items-start justify-between gap-3 lg:block">
              <div>
                <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">Operacion diaria</h1>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/68 lg:mt-3">
                  Gestoria, agencia y ayudas de tramites en una misma base.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/70 lg:hidden">
                {role}
              </div>
            </div>
          </div>

          <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-fit items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm transition lg:min-w-0 ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-white text-[#17343f] shadow-[0_12px_30px_rgba(255,255,255,0.12)]"
                    : "text-white/76 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="whitespace-nowrap">{item.label}</span>
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "bg-[var(--color-accent)]"
                      : "bg-white/18"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:mt-auto lg:grid-cols-1 lg:pt-8">
            <div className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Usuario activo</p>
              <p className="mt-2 text-sm font-semibold text-white">{userLabel}</p>
              <p className="mt-2 text-sm leading-6 text-white/68">Rol interno: {role}</p>
            </div>
            <div className="hidden rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 lg:block">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Jurisdiccion base</p>
              <p className="mt-2 text-sm font-semibold text-white">La Pampa</p>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Con criterios editables para tramites nacionales y provinciales.
              </p>
            </div>
            <SignOutButton />
          </div>
        </aside>

        <div className="flex-1 rounded-[28px] border border-[var(--color-line)] bg-white/86 backdrop-blur lg:rounded-[32px]">
          <header className="flex flex-col gap-4 border-b border-[var(--color-line)] px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-5">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Operacion autenticada
              </p>
              <p className="text-sm text-[var(--color-muted)]">
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

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <GlobalSearch items={searchItems} />
              <button className="w-full rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] sm:w-auto">
                Nuevo
              </button>
            </div>
          </header>

          <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
