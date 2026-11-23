import { notFound, redirect } from "next/navigation";
import { getCurrentAppUser } from "../../../lib/auth/user";
import AdminProductsManager from "../../../components/AdminProductsManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Fproducts");
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role) || !user.isActive) notFound();
  return <AdminProductsManager />;
}
