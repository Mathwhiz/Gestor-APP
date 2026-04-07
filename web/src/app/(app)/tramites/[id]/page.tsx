import { notFound } from "next/navigation";
import { ProcedureDetailWorkspace } from "@/components/procedure-detail-workspace";
import { canEditRole, requireAuthenticatedAppUser } from "@/lib/auth";
import { getProcedureDetailData } from "@/lib/data";

type ProcedureDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProcedureDetailPage({
  params,
}: ProcedureDetailPageProps) {
  const { id } = await params;
  const { profile } = await requireAuthenticatedAppUser();
  const detail = await getProcedureDetailData(id);

  if (!detail) {
    notFound();
  }

  return <ProcedureDetailWorkspace detail={detail} canEdit={canEditRole(profile.role)} />;
}
