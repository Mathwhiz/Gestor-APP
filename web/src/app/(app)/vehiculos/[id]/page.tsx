import { notFound } from "next/navigation";
import { VehicleDetailWorkspace } from "@/components/vehicle-detail-workspace";
import { requireAuthenticatedAppUser } from "@/lib/auth";
import { getVehicleDetailData } from "@/lib/data";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuthenticatedAppUser();
  const { id } = await params;
  const detail = await getVehicleDetailData(id);

  if (!detail) notFound();

  return <VehicleDetailWorkspace detail={detail} />;
}
