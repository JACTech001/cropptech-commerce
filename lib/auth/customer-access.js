import { redirect } from "next/navigation";
import { getCurrentAppUser } from "./user";

/**
 * Keep administrative identities inside the admin workspace.
 * Public visitors and customer accounts can still browse the storefront.
 */
export async function redirectAdminFromCustomerPages() {
  const user = await getCurrentAppUser();
  if (user && ["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    redirect("/admin");
  }
}
