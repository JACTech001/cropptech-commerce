import { redirect } from "next/navigation";
import { getCurrentAppUser } from "../lib/auth/user";
import HomePageClient from "../components/HomePageClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentAppUser();
  if (user && ["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    redirect("/admin");
  }
  return <HomePageClient />;
}
