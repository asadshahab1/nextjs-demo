import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

// Buyers must be signed in to place an order — the order needs a real
// account to attach to. Cart is client-side (localStorage), so it survives
// the round trip through the login page.

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "BUYER") redirect("/login/buyer");
  return <>{children}</>;
}
