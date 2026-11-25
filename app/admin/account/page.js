import { notFound, redirect } from "next/navigation";
import { getCurrentAppUser } from "../../../lib/auth/user";
import AdminShell from "../../../components/AdminShell";
import AdminThemeControl from "../../../components/AdminThemeControl";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Faccount");
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role) || !user.isActive) notFound();
  const fullName = user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0];
  return (
    <AdminShell email={user.email} adminName={fullName} isSuperAdmin={user.role === "SUPER_ADMIN"}>
      <main className="admin-page admin-route-page">
        <div className="admin-wrap">
          <div className="admin-heading"><p className="eyebrow">ADMINISTRATION / PERSONAL ACCOUNT</p><h1>Admin <em>account.</em></h1><p>Review your administrator identity and manage your personal workspace appearance.</p></div>
          <section className="admin-account-profile"><div className="admin-account-avatar">{(fullName[0] || "A").toUpperCase()}</div><div><p className="eyebrow">SIGNED-IN ADMINISTRATOR</p><h2>{fullName}</h2><p>{user.email}</p><span>{user.role === "SUPER_ADMIN" ? "SUPER ADMINISTRATOR" : "ADMINISTRATOR"}</span></div></section>
          <AdminThemeControl/>
          <p className="admin-setting-hint">Password changes and account recovery are managed by the secure sign-in provider. Use the sign-in page&apos;s recovery option if you need to reset your password.</p>
        </div>
      </main>
    </AdminShell>
  );
}
