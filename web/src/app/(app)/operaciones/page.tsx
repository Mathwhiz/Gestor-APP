import { OperationsWorkspace } from "@/components/operations-workspace";
import { canEditRole, requireAuthenticatedAppUser } from "@/lib/auth";
import { getContactsData, getOperationsData, getVehiclesData } from "@/lib/data";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  const params = (await searchParams) ?? {};
  const [operations, contacts, vehicles] = await Promise.all([
    getOperationsData({ includeArchived: true }),
    getContactsData(),
    getVehiclesData(),
  ]);

  type ContactOption = (typeof contacts)[number];
  type VehicleOption = (typeof vehicles)[number];

  return (
    <OperationsWorkspace
      initialItems={operations}
      contactOptions={contacts.map((contact: ContactOption) => ({ id: contact.id, name: contact.name }))}
      vehicleOptions={vehicles.map((vehicle: VehicleOption) => ({
        id: vehicle.id,
        label: `${vehicle.name} - ${vehicle.plate}`,
      }))}
      initialShowForm={Boolean(params.vehicle || params.buyer || params.seller)}
      initialDraft={{
        vehicle: typeof params.vehicle === "string" ? params.vehicle : "",
        buyer: typeof params.buyer === "string" ? params.buyer : "",
        seller: typeof params.seller === "string" ? params.seller : "Agencia",
      }}
      canEdit={canEditRole(profile.role)}
    />
  );
}
