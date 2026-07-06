"use server";

// SERVER ACTION: runs on the server, callable directly from a client component
// without a hand-written API route. Persists an order under the signed-in
// buyer's email. In a real app payment goes through a hosted provider
// (Stripe element / redirect) — this app never handles raw card data.

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Line = { name: string; priceCents: number; quantity: number };

export async function placeOrder(lines: Line[]) {
  const session = await getSession();
  if (!session || session.role !== "BUYER") {
    return { ok: false as const, error: "Please sign in as a buyer to place an order." };
  }
  if (!lines.length) return { ok: false as const, error: "Cart is empty." };
  const totalCents = lines.reduce((s, l) => s + l.priceCents * l.quantity, 0);
  const order = await prisma.order.create({
    data: {
      userEmail: session.email,
      totalCents,
      status: "placed",
      items: { create: lines.map((l) => ({ productName: l.name, priceCents: l.priceCents, quantity: l.quantity })) },
    },
  });
  return { ok: true as const, orderId: order.id };
}
