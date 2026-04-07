"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { PageHeader } from "@/components/page-header";
import { contacts as mockContacts } from "@/data/mock-data";
import {
  createContactAction,
  toggleContactArchivedAction,
  updateContactAction,
} from "@/app/(app)/actions";

type ContactItem = (typeof mockContacts)[number] & {
  archived?: boolean;
};

const roleFilters = [
  "Todos",
  "Cliente particular",
  "Clienta recurrente",
  "Tercero derivador",
  "Registro",
  "Proveedor",
  "Archivados",
] as const;

export function ContactsWorkspace({
  initialItems = mockContacts,
  canEdit,
}: {
  initialItems?: ContactItem[];
  canEdit: boolean;
}) {
  const [items, setItems] = useState<ContactItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<(typeof roleFilters)[number]>("Todos");
  const [draft, setDraft] = useState({
    name: "",
    role: "Cliente particular",
    document: "",
    phone: "",
    location: "Santa Rosa, La Pampa",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState({
    name: "",
    role: "Cliente particular",
    document: "",
    phone: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      items.filter((contact) => {
        const matchesSearch =
          !search ||
          `${contact.name} ${contact.role} ${contact.document} ${contact.location}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesRole =
          role === "Todos"
            ? !contact.archived
            : role === "Archivados"
              ? Boolean(contact.archived)
              : !contact.archived && contact.role === role;
        return matchesSearch && matchesRole;
      }),
    [items, role, search],
  );

  function addContact() {
    if (!canEdit || !draft.name.trim()) return;

    setError("");
    startTransition(async () => {
      const result = await createContactAction(draft);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) => [result.item, ...current]);
      setDraft({
        name: "",
        role: "Cliente particular",
        document: "",
        phone: "",
        location: "Santa Rosa, La Pampa",
      });
    });
  }

  function startEditing(contact: ContactItem) {
    setEditingId(contact.id);
    setEditingDraft({
      name: contact.name,
      role: contact.role,
      document: contact.document === "Sin documentar" ? "" : contact.document,
      phone: contact.phone === "Sin telefono" ? "" : contact.phone,
      location: contact.location === "Sin localidad" ? "" : contact.location,
    });
  }

  function saveEdit() {
    if (!canEdit || !editingId) return;

    setError("");
    startTransition(async () => {
      const result = await updateContactAction({
        id: editingId,
        ...editingDraft,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) =>
        current.map((contact) => (contact.id === editingId ? result.item : contact)),
      );
      setEditingId(null);
    });
  }

  function toggleArchived(contact: ContactItem) {
    if (!canEdit) return;

    setError("");
    startTransition(async () => {
      const result = await toggleContactArchivedAction({
        id: contact.id,
        archived: Boolean(contact.archived),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === contact.id
            ? { ...item, archived: result.item.archived, status: result.item.status }
            : item,
        ),
      );
      setEditingId(null);
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CRM"
        title="Contactos"
        description="Clientes, terceros, proveedores y organismos vinculados al trabajo diario."
        actionLabel="Nuevo contacto"
        actionDisabled={!canEdit}
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
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              {items.filter((item) => !item.archived).length}
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Base</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">La Pampa</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Filtro</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{role}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-panel-soft)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Archivados</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              {items.filter((item) => item.archived).length}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Alta rapida de contacto</p>
          {!canEdit ? <p className="text-sm text-[var(--color-muted)]">Tu rol solo puede consultar.</p> : null}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input value={draft.name} onChange={(event) => setDraft((c) => ({ ...c, name: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="Nombre" disabled={!canEdit || isPending} />
          <select value={draft.role} onChange={(event) => setDraft((c) => ({ ...c, role: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" disabled={!canEdit || isPending}>
            <option>Cliente particular</option>
            <option>Clienta recurrente</option>
            <option>Tercero derivador</option>
            <option>Registro</option>
            <option>Proveedor</option>
          </select>
          <input value={draft.document} onChange={(event) => setDraft((c) => ({ ...c, document: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="DNI / CUIT" disabled={!canEdit || isPending} />
          <input value={draft.phone} onChange={(event) => setDraft((c) => ({ ...c, phone: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" placeholder="Telefono" disabled={!canEdit || isPending} />
          <select value={draft.location} onChange={(event) => setDraft((c) => ({ ...c, location: event.target.value }))} className="h-11 rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-panel-soft)]" disabled={!canEdit || isPending}>
            <option>Santa Rosa, La Pampa</option>
            <option>Toay, La Pampa</option>
            <option>General Pico, La Pampa</option>
            <option>CABA</option>
          </select>
          <button onClick={addContact} disabled={!canEdit || isPending} className="h-11 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-45 md:col-span-2 xl:col-span-1">
            {isPending ? "Guardando..." : "Agregar"}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p> : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((contact) => {
          const isEditing = editingId === contact.id;

          return (
            <article key={contact.id} className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
              {isEditing ? (
                <div className="space-y-3">
                  <input value={editingDraft.name} onChange={(event) => setEditingDraft((current) => ({ ...current, name: event.target.value }))} className="h-11 w-full rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" />
                  <select value={editingDraft.role} onChange={(event) => setEditingDraft((current) => ({ ...current, role: event.target.value }))} className="h-11 w-full rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]">
                    <option>Cliente particular</option>
                    <option>Clienta recurrente</option>
                    <option>Tercero derivador</option>
                    <option>Registro</option>
                    <option>Proveedor</option>
                  </select>
                  <input value={editingDraft.document} onChange={(event) => setEditingDraft((current) => ({ ...current, document: event.target.value }))} className="h-11 w-full rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="DNI / CUIT" />
                  <input value={editingDraft.phone} onChange={(event) => setEditingDraft((current) => ({ ...current, phone: event.target.value }))} className="h-11 w-full rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Telefono" />
                  <input value={editingDraft.location} onChange={(event) => setEditingDraft((current) => ({ ...current, location: event.target.value }))} className="h-11 w-full rounded-2xl border border-[var(--color-line)] px-4 text-sm outline-none focus:border-[var(--color-accent)]" placeholder="Localidad" />
                  <div className="flex gap-3">
                    <button onClick={saveEdit} disabled={isPending} className="rounded-2xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-45">
                      Guardar
                    </button>
                    <button onClick={() => setEditingId(null)} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)]">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                  {canEdit ? (
                    <div className="mt-5 flex gap-3">
                      {!contact.archived ? (
                        <>
                          <Link href={`/contactos/${contact.id}`} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                            Abrir ficha
                          </Link>
                          <Link href={`/tramites?client=${encodeURIComponent(contact.name)}`} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                            Nuevo tramite
                          </Link>
                          <Link href={`/operaciones?buyer=${encodeURIComponent(contact.name)}`} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                            Nueva operacion
                          </Link>
                        </>
                      ) : null}
                      {!contact.archived ? (
                        <button onClick={() => startEditing(contact)} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                          Editar
                        </button>
                      ) : null}
                      <button onClick={() => toggleArchived(contact)} className="rounded-2xl border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                        {contact.archived ? "Reactivar" : "Archivar"}
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
