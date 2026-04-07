import { FinanceWorkspace } from "@/components/finance-workspace";
import { canEditRole, requireAuthenticatedAppUser } from "@/lib/auth";
import { getFinanceInsightsData, getFinancialMovementsData } from "@/lib/data";

export default async function FinancePage() {
  const { profile } = await requireAuthenticatedAppUser();
  const [movements, insights] = await Promise.all([
    getFinancialMovementsData(),
    getFinanceInsightsData(),
  ]);
  return (
    <FinanceWorkspace
      initialItems={movements}
      insights={insights}
      canEdit={canEditRole(profile.role)}
    />
  );
}
