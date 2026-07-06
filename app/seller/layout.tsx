import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

// Guards the entire /seller subtree. Nested pages (list, upload form, and
// any future seller-only routes) are all covered by this one check so we
// can't accidentally leak an ungated route.

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "SELLER") redirect("/login/seller");
  return <>{children}</>;
}
