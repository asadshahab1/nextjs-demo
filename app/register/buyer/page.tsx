import type { Metadata } from "next";
import { AuthForm } from "@/components/site/AuthForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create buyer account", robots: { index: false } };

export default function BuyerRegisterPage() {
  return <AuthForm role="BUYER" mode="register" />;
}
