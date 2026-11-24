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
            <p className="eyebrow">STORE MANAGEMENT / HOMEPAGE</p>
            <h1>Homepage <em>images.</em></h1>
            <p>Choose exactly which Cloudinary image appears in each homepage position. Product catalogue images are managed separately.</p>
          </div>
          <AdminHomepageMediaManager />
        </div>
      </main>
    </AdminShell>
  );
}
