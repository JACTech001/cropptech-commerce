import { redirect } from "next/navigation";
import { getCurrentAppUser } from "../../lib/auth/user";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin");
  if (!user.isActive || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) redirect("/");
  return children;
}
