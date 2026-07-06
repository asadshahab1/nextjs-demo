import type { Metadata } from "next";
import { AuthForm } from "@/components/site/AuthForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Seller sign in", robots: { index: false } };

export default function SellerLoginPage() {
  return <AuthForm role="SELLER" mode="login" />;
}
