import { redirect } from "next/navigation";
import { getCurrentAppUser } from "../lib/auth/user";
import HomePageClient from "../components/HomePageClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentAppUser();
  if (user && ["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    redirect("/admin");
  }
  const firstName = user?.firstName?.trim() || user?.fullName?.trim().split(/\s+/)[0] || null;
  return <HomePageClient firstName={firstName} />;
}
