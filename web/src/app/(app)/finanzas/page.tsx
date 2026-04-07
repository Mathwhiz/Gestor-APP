import { FinanceWorkspace } from "@/components/finance-workspace";
import { canEditRole, requireAuthenticatedAppUser } from "@/lib/auth";
import { getFinancialMovementsData } from "@/lib/data";

export default async function FinancePage() {
  const { profile } = await requireAuthenticatedAppUser();
  const movements = await getFinancialMovementsData();
  return <FinanceWorkspace initialItems={movements} canEdit={canEditRole(profile.role)} />;
}
