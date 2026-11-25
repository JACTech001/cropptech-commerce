import { notFound, redirect } from "next/navigation";
import { getCurrentAppUser } from "../../../lib/auth/user";
import AdminShell from "../../../components/AdminShell";
import AdminReturnsManager from "../../../components/AdminReturnsManager";

export const dynamic = "force-dynamic";

export default async function AdminReturnsPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Freturns");
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role) || !user.isActive) notFound();
  return (
    <AdminShell email={user.email} adminName={user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0]} isSuperAdmin={user.role === "SUPER_ADMIN"}>
      <main className="admin-page admin-route-page"><AdminReturnsManager/></main>
    </AdminShell>
  );
}
