"use server";

// SERVER ACTION: runs on the server, callable directly from a client component
// without a hand-written API route. Persists an order. In a real app the email
// comes from the auth session and payment goes through a hosted provider
// (Stripe element / redirect) — this app never handles raw card data.

import { prisma } from "@/lib/prisma";

type Line = { name: string; priceCents: number; quantity: number };

export async function placeOrder(lines: Line[]) {
  if (!lines.length) return { ok: false as const, error: "Cart is empty." };
  const totalCents = lines.reduce((s, l) => s + l.priceCents * l.quantity, 0);
  const order = await prisma.order.create({
    data: {
      userEmail: "demo@kiln.shop", // from session in a real app
      totalCents,
      status: "placed",
      items: { create: lines.map((l) => ({ productName: l.name, priceCents: l.priceCents, quantity: l.quantity })) },
    },
  });
  return { ok: true as const, orderId: order.id };
}
