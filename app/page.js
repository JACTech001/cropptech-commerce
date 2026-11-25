import { redirect } from "next/navigation";
import { getCurrentAppUser } from "../lib/auth/user";
import HomePageClient from "../components/HomePageClient";
import { prisma } from "../lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentAppUser();
  if (user && ["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    redirect("/admin");
  }
  const firstName = user?.firstName?.trim() || user?.fullName?.trim().split(/\s+/)[0] || null;
  const mediaSetting = await prisma.storeSetting.findUnique({ where: { key: "homepage_media" } });
  const homepageMedia = mediaSetting?.value && typeof mediaSetting.value === "object" ? mediaSetting.value : {};
  return <HomePageClient firstName={firstName} initialHomepageMedia={homepageMedia} />;
}
