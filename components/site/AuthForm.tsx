"use client";

// Shared client form for buyer/seller login and register. The role and mode
// are chosen by the containing page — this component is intentionally dumb.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, registerUser } from "@/app/actions/auth";

type Role = "BUYER" | "SELLER";
type Mode = "login" | "register";

export function AuthForm({ role, mode }: { role: Role; mode: Mode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const field = "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-pine outline-none";
  const roleLabel = role === "SELLER" ? "seller" : "buyer";
  const otherMode = mode === "login" ? "register" : "login";
  const dest = role === "SELLER" ? "/seller" : "/account/orders";

  const title = mode === "login" ? `${roleLabel[0].toUpperCase()}${roleLabel.slice(1)} sign in` : `Create a ${roleLabel} account`;
  const cta = mode === "login" ? "Sign in" : "Create account";

  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <h1 className="font-display text-4xl mb-2">{title}</h1>
      <p className="text-smoke mb-8">
        {mode === "login"
          ? role === "SELLER"
            ? "Access your seller central to upload and manage products."
            : "Sign in to view orders and complete checkout."
          : role === "SELLER"
          ? "Set up a seller account to list your work."
          : "Set up an account to save orders and speed up checkout."}
      </p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm text-smoke">Email</span>
          <input className={field} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-smoke">Password</span>
          <input className={field} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          disabled={isPending || !email || !password}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const res = mode === "login"
                ? await loginUser({ email, password, role })
                : await registerUser({ email, password, role });
              if (res.ok) {
                router.push(dest);
                router.refresh();
              } else {
                setError(res.error);
              }
            })
          }
          className="w-full rounded-full bg-ink text-porcelain px-6 py-3 text-sm hover:bg-pine transition-colors disabled:opacity-50"
        >
          {isPending ? "…" : cta}
        </button>

        <p className="text-sm text-smoke text-center">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <Link className="text-ink hover:text-pine underline" href={`/${otherMode}/${roleLabel}`}>
            {otherMode === "login" ? "Sign in" : "Create one"}
          </Link>
        </p>
        <p className="text-xs text-smoke text-center">
          {role === "SELLER" ? (
            <>Buying instead? <Link className="underline hover:text-ink" href={`/${mode}/buyer`}>Go to buyer {mode}</Link></>
          ) : (
            <>Selling instead? <Link className="underline hover:text-ink" href={`/${mode}/seller`}>Go to seller {mode}</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
