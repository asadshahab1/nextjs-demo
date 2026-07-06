import type { Metadata } from "next";
import { AuthForm } from "@/components/site/AuthForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create seller account", robots: { index: false } };

export default function SellerRegisterPage() {
  return <AuthForm role="SELLER" mode="register" />;
}
