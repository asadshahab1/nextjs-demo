import { getReviews } from "@/lib/data";

// ASYNC SERVER COMPONENT, streamed via <Suspense> on the PDP.
// It awaits a (deliberately slow) query on the server; while it waits, the
// event loop is free and the sibling Recommendations fetch runs concurrently.
// When this resolves, its HTML streams into the page. Ships zero client JS.
export async function Reviews({ productId }: { productId: string }) {
  const reviews = await getReviews(productId);
  if (reviews.length === 0) return <p className="text-smoke">No reviews yet.</p>;
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  return (
    <div>
      <p className="text-sm text-smoke mb-4">
        {avg} average · {reviews.length} reviews
      </p>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-line p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{r.author}</span>
              <span className="text-pine text-sm" aria-label={`${r.rating} out of 5`}>
                {"\u2605".repeat(r.rating)}
                {"\u2606".repeat(5 - r.rating)}
              </span>
            </div>
            <p className="text-ink/90 mt-1.5">{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
