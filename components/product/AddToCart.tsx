"use client";

// CLIENT COMPONENT: needs state + event handlers, so it opts into the client.
// The +/- update local state instantly (browser re-render, no server hit).
// Adding to cart updates the client cart store immediately and shows a brief
// confirmation — optimistic feel with no round-trip.

import { useState } from "react";
import { useCart } from "@/lib/cart-store";

export function AddToCart({
  product,
  maxStock,
}: {
  product: { id: string; name: string; priceCents: number; imageUrl: string };
  maxStock: number;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = maxStock <= 0;

  return (
    <div className="mt-7 flex items-center gap-3">
      <div className="inline-flex items-center rounded-full border border-line">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-10 h-10 grid place-items-center text-lg disabled:opacity-40"
          disabled={qty <= 1 || soldOut}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-8 text-center tabular-nums">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
          className="w-10 h-10 grid place-items-center text-lg disabled:opacity-40"
          disabled={qty >= maxStock || soldOut}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <button
        onClick={() => {
          add(product, qty);
          setAdded(true);
          setTimeout(() => setAdded(false), 1600);
        }}
        disabled={soldOut}
        className="rounded-full bg-ink text-porcelain px-7 h-11 text-sm hover:bg-pine transition-colors disabled:opacity-40 disabled:hover:bg-ink"
      >
        {soldOut ? "Sold out" : added ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
