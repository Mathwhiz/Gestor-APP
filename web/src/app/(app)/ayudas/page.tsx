import { GuidesWorkspace } from "@/components/guides-workspace";
import { canEditRole, requireAuthenticatedAppUser } from "@/lib/auth";
import { getGuidesData } from "@/lib/data";

export default async function GuidesPage() {
  const { profile } = await requireAuthenticatedAppUser();
  const guides = await getGuidesData({ includeArchived: true });

  return <GuidesWorkspace initialItems={guides} canEdit={canEditRole(profile.role)} />;
}
