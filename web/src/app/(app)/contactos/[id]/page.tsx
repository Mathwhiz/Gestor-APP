import { notFound } from "next/navigation";
import { ContactDetailWorkspace } from "@/components/contact-detail-workspace";
import { requireAuthenticatedAppUser } from "@/lib/auth";
import { getContactDetailData } from "@/lib/data";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuthenticatedAppUser();
  const { id } = await params;
  const detail = await getContactDetailData(id);

  if (!detail) notFound();

  return <ContactDetailWorkspace detail={detail} />;
}
