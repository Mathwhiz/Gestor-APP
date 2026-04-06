"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { contacts as seedContacts } from "@/data/mock-data";

type ContactItem = (typeof seedContacts)[number];

const roleFilters = ["Todos", "Cliente particular", "Clienta recurrente", "Tercero derivador", "Registro", "Proveedor"] as const;

export function ContactsWorkspace() {
  const [items, setItems] = useState<ContactItem[]>(seedContacts);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<(typeof roleFilters)[number]>("Todos");
  const [draft, setDraft] = useState({
    name: "",
    role: "Cliente particular",
    document: "",
    phone: "",
    location: "Santa Rosa, La Pampa",
  });

  const filtered = useMemo(
    () =>
      items.filter((contact) => {
        const matchesSearch =
          !search ||
          `${contact.name} ${contact.role} ${contact.document} ${contact.location}`
            .toLowerCase()
            .includes(search.toLowerCase());
        return matchesSearch && (role === "Todos" || contact.role === role);
      }),
    [items, role, search],
  );

  function addContact() {
    if (!draft.name.trim()) return;
    setItems((current) => [
      {
        id: `contact-${Date.now()}`,
        name: draft.name,
        role: draft.role,
        document: draft.document || "Sin documentar",
        phone: draft.phone || "Sin telefono",
        location: draft.location,
        status: "Activo",
      },
      ...current,
    ]);
    setDraft({
      name: "",
      role: "Cliente particular",
      document: "",
      phone: "",
      location: "Santa Rosa, La Pampa",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CRM"
        title="Contactos"
        description="Clientes, terceros, proveedores y organismos vinculados al trabajo diario."
        actionLabel="Nuevo contacto"
      />

      <section className="grid gap-4 rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, documento o localidad"
            className="h-12 w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <div className="flex flex-wrap gap-3">
            {roleFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setRole(filter)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  role === filter
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Contactos</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{filtered.length}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Base</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">La Pampa</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Filtro</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{role}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
        <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Alta rapida de contacto</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input value={draft.name} onChange={(event) => setDraft((c) => ({ ...c, name: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Nombre" />
          <input value={draft.role} onChange={(event) => setDraft((c) => ({ ...c, role: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Rol" />
          <input value={draft.document} onChange={(event) => setDraft((c) => ({ ...c, document: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="DNI / CUIT" />
          <input value={draft.phone} onChange={(event) => setDraft((c) => ({ ...c, phone: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Telefono" />
          <button onClick={addContact} className="h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]">
            Agregar
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((contact) => (
          <article key={contact.id} className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">{contact.name}</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{contact.role}</p>
              </div>
              <span className="rounded-full bg-[var(--color-panel-soft)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {contact.status}
              </span>
            </div>
            <div className="mt-5 space-y-3 text-sm text-[var(--color-muted)]">
              <p>{contact.document}</p>
              <p>{contact.phone}</p>
              <p>{contact.location}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
