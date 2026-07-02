import { searchProducts } from "@/lib/data";
import { ProductCard } from "@/components/product/ProductCard";
import type { Metadata } from "next";

// RENDERING STRATEGY: SSR from the query string.
// Results depend on ?q= so there's nothing to pre-build, and we want results in
// the server HTML (shareable, indexable for common queries). `searchParams` is
// dynamic, so this route renders per request automatically.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Search", robots: { index: false } };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams; // Next 15: searchParams is async
  const results = await searchProducts(q);

  return (
    <div className="mx-auto max-w-content px-5 py-12">
      <h1 className="font-display text-3xl mb-2">
        {q ? <>Results for “{q}”</> : "Search"}
      </h1>
      <p className="text-smoke mb-10">
        {q ? `${results.length} ${results.length === 1 ? "piece" : "pieces"} found` : "Type a query in the search box above."}
      </p>

      {q && results.length === 0 && (
        <p className="text-smoke">Nothing matched. Try a material like “porcelain” or a form like “vase”.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
        {results.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
