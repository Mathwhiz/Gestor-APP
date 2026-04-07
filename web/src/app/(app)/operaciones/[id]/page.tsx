import { notFound } from "next/navigation";
import { OperationDetailWorkspace } from "@/components/operation-detail-workspace";
import { requireAuthenticatedAppUser } from "@/lib/auth";
import { getOperationDetailData } from "@/lib/data";

export default async function OperationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuthenticatedAppUser();
  const { id } = await params;
  const detail = await getOperationDetailData(id);

  if (!detail) notFound();

  return <OperationDetailWorkspace detail={detail} />;
}
