"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
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

const quickCreateLinks = [
  { href: "/tramites?create=1", label: "Nuevo tramite", description: "Abrir alta rapida de gestion." },
  { href: "/contactos", label: "Nuevo contacto", description: "Cargar cliente, tercero u organismo." },
  { href: "/tareas", label: "Nueva tarea", description: "Registrar seguimiento del dia." },
  { href: "/operaciones", label: "Nueva operacion", description: "Pasar una unidad a seguimiento comercial." },
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
    kind: "tramite" | "contacto" | "vehiculo" | "operacion" | "tarea" | "guia";
  }[];
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#efe7da_0%,#f6f3ec_35%,#f3efe6_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-3 py-3 lg:flex-row lg:gap-4 lg:px-5 lg:py-4">
        <div className="mb-3 flex items-center justify-between rounded-[22px] border border-[var(--color-line)] bg-[linear-gradient(180deg,#17343f_0%,#132b34_100%)] px-4 py-3 text-white shadow-[0_24px_70px_rgba(23,52,63,0.18)] lg:hidden">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">Gestor App</p>
            <p className="mt-1 text-sm font-semibold">{userLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/80"
          >
            Menu
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-40 bg-[#0d1a20]/45 lg:hidden" onClick={closeMobileMenu}>
            <aside
              className="absolute left-0 top-0 flex h-full w-[min(84vw,320px)] flex-col bg-[linear-gradient(180deg,#17343f_0%,#132b34_100%)] px-5 py-5 text-white shadow-[0_24px_70px_rgba(23,52,63,0.24)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/55">Gestor App</p>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight">Operacion diaria</h2>
                  <p className="mt-2 text-sm text-white/68">Rol: {role}</p>
                </div>
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="rounded-full border border-white/14 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-white/80"
                >
                  Cerrar
                </button>
              </div>

              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
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
                <div className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">Usuario activo</p>
                  <p className="mt-2 text-sm font-semibold text-white">{userLabel}</p>
                </div>
                <SignOutButton />
              </div>
            </aside>
          </div>
        ) : null}

        <aside className="mb-3 hidden shrink-0 flex-col rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(180deg,#17343f_0%,#132b34_100%)] px-4 py-4 text-white shadow-[0_24px_70px_rgba(23,52,63,0.18)] lg:mb-0 lg:flex lg:w-[280px] lg:rounded-[32px] lg:px-6 lg:py-5">
          <div className="mb-5 lg:mb-8">
            <p className="text-xs uppercase tracking-[0.22em] text-white/55">Gestor App</p>
            <h1 className="mt-3 text-xl font-semibold tracking-tight lg:text-2xl">Operacion diaria</h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/68 lg:mt-3">
              Gestoria, agencia y ayudas de tramites en una misma base.
            </p>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-white text-[#17343f] shadow-[0_12px_30px_rgba(255,255,255,0.12)]"
                    : "text-white/76 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{item.label}</span>
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
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--color-ink)]">{userLabel}</p>
              <p className="text-sm text-[var(--color-muted)]">Rol: {role}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <GlobalSearch items={searchItems} />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setQuickMenuOpen((current) => !current)}
                  className="w-full rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] sm:w-auto"
                >
                  Nuevo
                </button>
                {quickMenuOpen ? (
                  <div className="absolute right-0 z-20 mt-3 w-[min(92vw,320px)] rounded-[24px] border border-[var(--color-line)] bg-white p-3 shadow-[0_24px_70px_rgba(23,52,63,0.16)]">
                    <p className="px-2 pt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Altas rapidas
                    </p>
                    <div className="mt-2 space-y-2">
                      {quickCreateLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setQuickMenuOpen(false)}
                          className="block rounded-2xl border border-[var(--color-line)] px-4 py-3 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-panel-soft)]"
                        >
                          <p className="text-sm font-semibold text-[var(--color-ink)]">{item.label}</p>
                          <p className="mt-1 text-sm text-[var(--color-muted)]">{item.description}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
