import { redirect } from "next/navigation";
import { getCurrentAppUser } from "../../../lib/auth/user";
import AdminShell from "../../../components/AdminShell";
import AdminSupportInbox from "../../../components/AdminSupportInbox";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Fsupport");
  if (!user.isActive || !["ADMIN","SUPER_ADMIN"].includes(user.role)) redirect("/");
  return <AdminShell email={user.email} adminName={user.fullName || user.email.split("@")[0]} isSuperAdmin={user.role === "SUPER_ADMIN"}><main className="admin-page admin-route-page"><div className="admin-wrap"><div className="admin-heading"><p className="eyebrow">STORE OPERATIONS / CUSTOMER CARE</p><h1>Customer <em>support.</em></h1><p>Manage customer requests, respond to conversations and keep track of outstanding issues.</p></div><AdminSupportInbox/></div></main></AdminShell>;
}
