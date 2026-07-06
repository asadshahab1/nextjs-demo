// Streaming fallbacks. These render instantly inside <Suspense fallback=...>
// while the async Server Component behind them is still fetching on the server.
// They're also what the App Router shows during route transitions via the
// per-route loading.tsx files under app/.

export function ProductCardSkeleton() {
  return (
    <div aria-hidden>
      <div className="skeleton aspect-square rounded-xl" />
      <div className="skeleton h-4 w-2/3 rounded mt-3" />
      <div className="skeleton h-3 w-1/3 rounded mt-2" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ReviewsSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-line p-4">
          <div className="skeleton h-4 w-32 rounded mb-2" />
          <div className="skeleton h-3 w-full rounded mb-1.5" />
          <div className="skeleton h-3 w-3/4 rounded" />
        </div>
      ))}
    </div>
  );
}

export function RecommendationsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          <div className="skeleton aspect-square rounded-xl" />
          <div className="skeleton h-4 w-2/3 rounded mt-3" />
        </div>
      ))}
    </div>
  );
}
