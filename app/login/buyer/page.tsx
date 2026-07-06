import type { Metadata } from "next";
import { AuthForm } from "@/components/site/AuthForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Buyer sign in", robots: { index: false } };

export default function BuyerLoginPage() {
  return <AuthForm role="BUYER" mode="login" />;
}
