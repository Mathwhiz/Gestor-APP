import { FinanceWorkspace } from "@/components/finance-workspace";
import { getFinancialMovementsData } from "@/lib/data";

export default async function FinancePage() {
  const movements = await getFinancialMovementsData();
  return <FinanceWorkspace initialItems={movements} />;
}
