import { ContactsWorkspace } from "@/components/contacts-workspace";
import { getContactsData } from "@/lib/data";

export default async function ContactsPage() {
  const contacts = await getContactsData();
  return <ContactsWorkspace initialItems={contacts} />;
}
