import { notFound, redirect } from "next/navigation";
import { getCurrentAppUser } from "../../../lib/auth/user";
import AdminFeaturedProductsManager from "../../../components/AdminFeaturedProductsManager";
import AdminShell from "../../../components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminFeaturedProductsPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Ffeatured-products");
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role) || !user.isActive) notFound();

  return (
    <AdminShell email={user.email} adminName={user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0]} isSuperAdmin={user.role === "SUPER_ADMIN"}>
      <main className="admin-page admin-route-page">
        <div className="admin-wrap">
          <div className="admin-heading">
            <p className="eyebrow">STORE MANAGEMENT / HOMEPAGE CURATION</p>
            <h1>Featured <em>Products.</em></h1>
            <p>Choose the exact products customers see in the homepage product section, then arrange their display order. This does not change the main Shop catalogue.</p>
          </div>
          <AdminFeaturedProductsManager />
        </div>
      </main>
    </AdminShell>
  );
}
