import { VehiclesWorkspace } from "@/components/vehicles-workspace";
import { canEditRole, requireAuthenticatedAppUser } from "@/lib/auth";
import { getVehiclesData } from "@/lib/data";

export default async function VehiclesPage() {
  const { profile } = await requireAuthenticatedAppUser();
  const vehicles = await getVehiclesData({ includeArchived: true });
  return <VehiclesWorkspace initialItems={vehicles} canEdit={canEditRole(profile.role)} />;
}
