import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

// Guards the whole /account subtree so future account pages (profile, saved
// addresses, etc.) are covered by one check.

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "BUYER") redirect("/login/buyer");
  return <>{children}</>;
}
