import { getRecommendations } from "@/lib/data";
import { ProductCard } from "@/components/product/ProductCard";

// ASYNC SERVER COMPONENT, streamed via <Suspense>. Sibling of <Reviews>, so
// their awaits overlap. This one is the slowest -> flushes last, popping into
// its skeleton slot when ready.
export async function Recommendations({
  productId,
  categoryId,
}: {
  productId: string;
  categoryId: string;
}) {
  const recs = await getRecommendations(productId, categoryId);
  if (recs.length === 0) return <p className="text-smoke">Nothing else here yet.</p>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {recs.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
