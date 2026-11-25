import { notFound, redirect } from "next/navigation";
import { getCurrentAppUser } from "../../../lib/auth/user";
import AdminShell from "../../../components/AdminShell";
import AdminStoreSettings from "../../../components/AdminStoreSettings";
import AdminThemeControl from "../../../components/AdminThemeControl";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Fsettings");
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role) || !user.isActive) notFound();
  return (
    <AdminShell email={user.email} adminName={user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0]} isSuperAdmin={user.role === "SUPER_ADMIN"}>
      <main className="admin-page admin-route-page">
        <div className="admin-wrap">
          <div className="admin-heading">
            <p className="eyebrow">STORE MANAGEMENT / SETTINGS</p>
            <h1>Store <em>settings.</em></h1>
            <p>Configure the store's payment destination and shared administrative preferences.</p>
          </div>
          <AdminStoreSettings />
          <AdminThemeControl/>
        </div>
      </main>
    </AdminShell>
  );
}
