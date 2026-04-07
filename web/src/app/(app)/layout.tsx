import { AppShell } from "@/components/app-shell";
import { requireAuthenticatedAppUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, profile } = await requireAuthenticatedAppUser();
  const { searchItems } = await getDashboardData();
  return (
    <AppShell
      role={profile.role}
      userLabel={profile.fullName ?? user.email ?? "Usuario"}
      searchItems={searchItems}
    >
      {children}
    </AppShell>
  );
}
