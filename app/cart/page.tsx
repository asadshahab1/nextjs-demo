"use client";

// RENDERING STRATEGY: CSR. The cart is per-user and has no SEO value, so it's
// a Client Component reading the in-browser cart store. Quantity changes update
// instantly from local state — no server round-trip, no regeneration.

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/data";

export default function CartPage() {
  const { lines, setQty, remove, totalCents } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-content px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <p className="text-smoke mt-2">Find something with a good weight to it.</p>
        <Link href="/" className="inline-block mt-6 rounded-full bg-ink text-porcelain px-6 py-3 text-sm hover:bg-pine transition-colors">
          Browse ceramics
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-4xl mb-8">Cart</h1>
      <ul className="divide-y divide-line">
        {lines.map((l) => (
          <li key={l.id} className="py-5 flex gap-4 items-center">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-line shrink-0">
              <Image src={l.imageUrl} alt={l.name} fill sizes="80px" className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-display text-lg">{l.name}</p>
              <p className="text-smoke text-sm tabular-nums">{formatPrice(l.priceCents)} each</p>
            </div>
            <div className="inline-flex items-center rounded-full border border-line">
              <button onClick={() => setQty(l.id, l.quantity - 1)} className="w-9 h-9" aria-label="Decrease">−</button>
              <span className="w-8 text-center tabular-nums">{l.quantity}</span>
              <button onClick={() => setQty(l.id, l.quantity + 1)} className="w-9 h-9" aria-label="Increase">+</button>
            </div>
            <span className="w-20 text-right tabular-nums">{formatPrice(l.priceCents * l.quantity)}</span>
            <button onClick={() => remove(l.id)} className="text-smoke hover:text-ink text-sm ml-2" aria-label={`Remove ${l.name}`}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-lg">Subtotal</span>
        <span className="font-display text-2xl tabular-nums">{formatPrice(totalCents)}</span>
      </div>
      <Link
        href="/checkout"
        className="mt-6 block text-center rounded-full bg-ink text-porcelain px-6 py-3.5 text-sm hover:bg-pine transition-colors"
      >
        Checkout
      </Link>
    </div>
  );
}
