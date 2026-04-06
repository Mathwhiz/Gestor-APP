import { ProceduresWorkspace } from "@/components/procedures-workspace";
import { getProceduresData } from "@/lib/data";

export default async function ProceduresPage() {
  const procedures = await getProceduresData();
  return <ProceduresWorkspace initialItems={procedures} />;
}
