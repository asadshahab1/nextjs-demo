"use client";
// CLIENT COMPONENT: reads live cart count from client state and updates
// instantly on add — no server round-trip, no navigation.
import Link from "next/link";
import { useCart } from "@/lib/cart-store";

export function CartBadge() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="relative inline-flex items-center gap-1.5 text-sm text-ink" aria-label={`Cart, ${count} items`}>
      <span>Cart</span>
      <span className="min-w-5 h-5 px-1 grid place-items-center rounded-full bg-pine text-porcelain text-xs tabular-nums">
        {count}
      </span>
    </Link>
  );
}
