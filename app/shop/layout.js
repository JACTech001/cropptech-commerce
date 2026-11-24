import { redirectAdminFromCustomerPages } from "../../lib/auth/customer-access";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }) {
  await redirectAdminFromCustomerPages();
  return children;
}
