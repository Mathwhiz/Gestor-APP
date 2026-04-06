import { notFound } from "next/navigation";
import { ProcedureDetailWorkspace } from "@/components/procedure-detail-workspace";
import { procedureDetails } from "@/data/mock-data";

type ProcedureDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProcedureDetailPage({
  params,
}: ProcedureDetailPageProps) {
  const { id } = await params;
  const detail = procedureDetails[id];

  if (!detail) {
    notFound();
  }

  return <ProcedureDetailWorkspace detail={detail} />;
}
