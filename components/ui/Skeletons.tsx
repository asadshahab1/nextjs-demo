// Streaming fallbacks. These render instantly inside <Suspense fallback=...>
// while the async Server Component behind them is still fetching on the server.
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
