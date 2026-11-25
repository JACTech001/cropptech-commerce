import { notFound, redirect } from "next/navigation";
import { getCurrentAppUser } from "../../../lib/auth/user";
import AdminShell from "../../../components/AdminShell";
import AdminTeamManager from "../../../components/AdminTeamManager";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Fteam");
  if (user.role !== "SUPER_ADMIN" || !user.isActive) notFound();
  return (
    <AdminShell email={user.email} adminName={user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0]} isSuperAdmin>
      <main className="admin-page admin-route-page">
        <div className="admin-wrap">
          <div className="admin-heading"><p className="eyebrow">SECURITY / ACCESS CONTROL</p><h1>Admin <em>management.</em></h1><p>Grant, deactivate and restore administrator access while preserving the history of previous work.</p></div>
          <AdminTeamManager/>
        </div>
      </main>
    </AdminShell>
  );
}
