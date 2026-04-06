import { PageHeader } from "@/components/page-header";
import { contacts } from "@/data/mock-data";

export default function ContactsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CRM"
        title="Contactos"
        description="Clientes, terceros, proveedores y organismos vinculados al trabajo diario."
        actionLabel="Nuevo contacto"
      />

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {contacts.map((contact) => (
          <article
            key={contact.id}
            className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                  {contact.name}
                </p>
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
