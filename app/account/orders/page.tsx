import { getOrdersForUser, formatPrice } from "@/lib/data";
import { getSession } from "@/lib/auth";
import type { Metadata } from "next";

// RENDERING STRATEGY: SSR, personalized. Order history is per-user and should
// be correct on first paint, so it's rendered on the server per request reading
// the session user. `force-dynamic` because the data is user-specific and live.
// Route access is enforced by app/account/layout.tsx; we just need the session
// email to scope the query.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your orders", robots: { index: false } };

export default async function OrdersPage() {
  const session = (await getSession())!;
  const orders = await getOrdersForUser(session.email);

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-display text-4xl mb-2">Your orders</h1>
      <p className="text-smoke mb-10">Signed in as {session.email}</p>

      {orders.length === 0 ? (
        <p className="text-smoke">No orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-line p-5">
              <div className="flex justify-between items-baseline">
                <span className="font-medium">#{o.id.slice(0, 8)}</span>
                <span className="text-sm text-smoke capitalize">{o.status}</span>
              </div>
              <p className="text-sm text-smoke mt-0.5">
                {new Date(o.createdAt).toLocaleDateString()}
              </p>
              <ul className="mt-3 text-sm space-y-1">
                {o.items.map((it) => (
                  <li key={it.id} className="flex justify-between">
                    <span>{it.productName} × {it.quantity}</span>
                    <span className="tabular-nums">{formatPrice(it.priceCents * it.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between mt-3 pt-3 border-t border-line">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(o.totalCents)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
