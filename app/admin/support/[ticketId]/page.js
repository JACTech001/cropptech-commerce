import { notFound, redirect } from "next/navigation";
import { getCurrentAppUser } from "../../../../lib/auth/user";
import AdminShell from "../../../../components/AdminShell";
import SupportConversation from "../../../../components/SupportConversation";

export const dynamic = "force-dynamic";

export default async function AdminSupportTicketPage({ params }) {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Fsupport");
  if (!user.isActive || !["ADMIN","SUPER_ADMIN"].includes(user.role)) notFound();
  const { ticketId } = await params;
  return <AdminShell email={user.email} adminName={user.fullName || user.email.split("@")[0]} isSuperAdmin={user.role === "SUPER_ADMIN"}><main className="admin-page admin-route-page"><div className="admin-wrap"><div className="admin-heading"><p className="eyebrow">CUSTOMER CARE / REQUEST DETAILS</p><h1>Support <em>conversation.</em></h1></div><SupportConversation ticketId={ticketId} isStaff/></div></main></AdminShell>;
}
