import AdminShell from "@/components/admin/AdminShell";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.adminId) {
    redirect("/admin/login");
  }

  return (
    <AdminShell adminEmail={session.adminEmail ?? ""}>{children}</AdminShell>
  );
}
