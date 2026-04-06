import { PageHeader } from "@/components/page-header";
import { vehicles } from "@/data/mock-data";
import { StatusBadge } from "@/components/status-badge";

export default function VehiclesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Vehiculos"
        title="Parque y unidades"
        description="Vista unica para autos en tramite, stock de agencia y documentacion vinculada."
        actionLabel="Nuevo vehiculo"
      />

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((vehicle) => (
          <article
            key={vehicle.id}
            className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {vehicle.plate}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-ink)]">
                  {vehicle.name}
                </h2>
              </div>
              <StatusBadge tone={vehicle.tone}>{vehicle.status}</StatusBadge>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-[var(--color-muted)]">
              <p>Titular: {vehicle.owner}</p>
              <p>Area: {vehicle.area}</p>
              <p>Nota: {vehicle.note}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
