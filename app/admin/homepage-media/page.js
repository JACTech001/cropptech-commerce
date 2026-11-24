import { notFound, redirect } from "next/navigation";
import { getCurrentAppUser } from "../../../lib/auth/user";
import AdminShell from "../../../components/AdminShell";
import AdminHomepageMediaManager from "../../../components/AdminHomepageMediaManager";

export const dynamic = "force-dynamic";

export default async function AdminHomepageMediaPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Fhomepage-media");
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role) || !user.isActive) notFound();

  return (
    <AdminShell email={user.email} adminName={user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0]}>
      <main className="admin-page admin-route-page">
        <div className="admin-wrap">
          <div className="admin-heading">
            <p className="eyebrow">STORE MANAGEMENT / STORE FRONT STUDIO</p>
            <h1>Store Front <em>Studio.</em></h1>
            <p>Curate the images and visual placements customers see across your storefront. Product catalogue images are managed separately.</p>
          </div>
          <AdminHomepageMediaManager />
        </div>
      </main>
    </AdminShell>
  );
}
