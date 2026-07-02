"use client";

// CLIENT COMPONENT: the real-time value. It renders the server-provided initial
// stock immediately (so the number is correct on first paint / for the crawler),
// then polls /api/stock/[id] to keep it live. This is exactly the pattern we
// settled on: SEO-relevant content stays in the server HTML; the live-updating
// value is handled client-side (here via polling; a WebSocket/SSE would slot in
// the same place). No page regeneration involved.

import { useEffect, useState } from "react";

export function LiveStock({
  productId,
  initialStock,
}: {
  productId: string;
  initialStock: number;
}) {
  const [stock, setStock] = useState(initialStock);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/stock/${productId}`, { cache: "no-store" });
        const data = await res.json();
        if (alive && typeof data.stock === "number") setStock(data.stock);
      } catch {
        /* ignore transient errors */
      }
    };
    const interval = setInterval(tick, 5000); // poll every 5s
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [productId]);

  if (stock <= 0) {
    return <p className="mt-4 text-sm text-smoke">Currently sold out</p>;
  }
  return (
    <p className="mt-4 text-sm flex items-center gap-2">
      <span className="inline-block w-2 h-2 rounded-full bg-pine-bright animate-pulse" />
      <span className={stock <= 5 ? "text-pine font-medium" : "text-smoke"}>
        {stock <= 5 ? `Only ${stock} left` : `${stock} in stock`}
      </span>
    </p>
  );
}
