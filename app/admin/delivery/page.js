import { notFound, redirect } from "next/navigation";
import { getCurrentAppUser } from "../../../lib/auth/user";
import AdminShell from "../../../components/AdminShell";
import AdminDeliveryManager from "../../../components/AdminDeliveryManager";

export const dynamic = "force-dynamic";

export default async function AdminDeliveryPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Fdelivery");
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role) || !user.isActive) notFound();
  return (
    <AdminShell email={user.email} adminName={user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0]} isSuperAdmin={user.role === "SUPER_ADMIN"}>
      <main className="admin-page admin-route-page">
        <div className="admin-wrap">
          <div className="admin-heading"><p className="eyebrow">STORE OPERATIONS / DELIVERY</p><h1>Delivery <em>management.</em></h1><p>Manage delivery coverage, checkout fees and estimated delivery windows. Handle dispatch and shipment progress from Orders.</p></div>
          <AdminDeliveryManager/>
        </div>
      </main>
    </AdminShell>
  );
}
