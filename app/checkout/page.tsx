"use client";

// RENDERING STRATEGY: private, per-user -> client-interactive. The order is
// submitted through the placeOrder SERVER ACTION (no hand-written API route).
// Payment itself would hand off to a hosted provider; this demo just records
// the order. First-paint speed and SEO are irrelevant behind checkout.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/data";
import { placeOrder } from "@/app/actions/orders";
import Link from "next/link";

export default function CheckoutPage() {
  const { lines, totalCents, clear } = useCart();
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState<string | null>(null);
  const router = useRouter();

  if (done) {
    return (
      <div className="mx-auto max-w-content px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Order placed</h1>
        <p className="text-smoke mt-2">Reference {done.slice(0, 8)}. A confirmation would be emailed in a real store.</p>
        <Link href="/account/orders" className="inline-block mt-6 rounded-full bg-ink text-porcelain px-6 py-3 text-sm hover:bg-pine transition-colors">
          View your orders
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-content px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Nothing to check out</h1>
        <Link href="/" className="inline-block mt-6 text-pine underline">Back to the shop</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-12">
      <h1 className="font-display text-4xl mb-8">Checkout</h1>
      <ul className="divide-y divide-line mb-6">
        {lines.map((l) => (
          <li key={l.id} className="py-3 flex justify-between text-sm">
            <span>{l.name} × {l.quantity}</span>
            <span className="tabular-nums">{formatPrice(l.priceCents * l.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between text-lg mb-8">
        <span>Total</span>
        <span className="font-display tabular-nums">{formatPrice(totalCents)}</span>
      </div>

      <p className="text-sm text-smoke mb-4">
        Payment would be collected here by a hosted provider (no card data touches this app).
      </p>

      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await placeOrder(
              lines.map((l) => ({ name: l.name, priceCents: l.priceCents, quantity: l.quantity }))
            );
            if (res.ok) {
              clear();
              setDone(res.orderId);
            }
          })
        }
        className="w-full rounded-full bg-ink text-porcelain px-6 py-3.5 text-sm hover:bg-pine transition-colors disabled:opacity-50"
      >
        {isPending ? "Placing order…" : "Place order"}
      </button>
      <button onClick={() => router.push("/cart")} className="w-full text-center text-sm text-smoke mt-4 hover:text-ink">
        Back to cart
      </button>
    </div>
  );
}
