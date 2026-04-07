import { ContactsWorkspace } from "@/components/contacts-workspace";
import { canEditRole, requireAuthenticatedAppUser } from "@/lib/auth";
import { getContactsData } from "@/lib/data";

export default async function ContactsPage() {
  const { profile } = await requireAuthenticatedAppUser();
  const contacts = await getContactsData({ includeArchived: true });
  return <ContactsWorkspace initialItems={contacts} canEdit={canEditRole(profile.role)} />;
}
