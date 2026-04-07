import { ProceduresWorkspace } from "@/components/procedures-workspace";
import { canEditRole, requireAuthenticatedAppUser } from "@/lib/auth";
import { getContactsData, getProceduresData, getVehiclesData } from "@/lib/data";

export default async function ProceduresPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await requireAuthenticatedAppUser();
  const params = (await searchParams) ?? {};
  const [procedures, contacts, vehicles] = await Promise.all([
    getProceduresData(),
    getContactsData(),
    getVehiclesData(),
  ]);

  type ContactOption = (typeof contacts)[number];
  type VehicleOption = (typeof vehicles)[number];

  return (
    <ProceduresWorkspace
      initialItems={procedures}
      contactOptions={contacts.map((contact: ContactOption) => ({ id: contact.id, name: contact.name }))}
      vehicleOptions={vehicles.map((vehicle: VehicleOption) => ({
        id: vehicle.id,
        label: `${vehicle.name} - ${vehicle.plate}`,
      }))}
      initialShowForm={
        params.create === "1" || params.create === "true" || Boolean(params.client || params.vehicle)
      }
      initialDraft={{
        client: typeof params.client === "string" ? params.client : "",
        vehicle: typeof params.vehicle === "string" ? params.vehicle : "",
      }}
      canEdit={canEditRole(profile.role)}
    />
  );
}
