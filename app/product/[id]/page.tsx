import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { getProduct, formatPrice } from "@/lib/data";
import { Reviews } from "@/components/product/Reviews";
import { Recommendations } from "@/components/product/Recommendations";
import { AddToCart } from "@/components/product/AddToCart";
import { LiveStock } from "@/components/product/LiveStock";
import { ReviewsSkeleton, RecommendationsSkeleton } from "@/components/ui/Skeletons";

// RENDERING STRATEGY: SSR (dynamic) for the core, streaming for the rest.
// This is the centerpiece. On a high-upload-volume marketplace we can't
// pre-build every product page in time, but the product content MUST be in the
// server HTML for SEO. So the SEO-critical core (name, price, description,
// image) is rendered on the server PER REQUEST — a product uploaded seconds
// ago gets a fully indexable page instantly. `force-dynamic` opts this route
// into per-request rendering.
export const dynamic = "force-dynamic";

// METADATA API: real per-product metadata + Open Graph, so search + social
// previews carry the actual product — the whole reason SSR beats client-only
// fetching here.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} · Kiln`,
      description: product.description,
      images: [{ url: product.imageUrl }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-content px-5 py-12">
      {/* CORE (server-rendered, in the initial HTML -> crawlable, fast paint) */}
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-line">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority /* the LCP image on this page */
            sizes="(max-width: 768px) 100vw, 560px"
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-pine">{product.category.name}</p>
          <h1 className="font-display text-4xl md:text-5xl mt-2">{product.name}</h1>
          <p className="text-smoke mt-1">
            {product.material} · by {product.maker}
          </p>
          <p className="text-2xl mt-6 tabular-nums">{formatPrice(product.priceCents)}</p>

          {/* LIVE STOCK — client component. Renders an initial server value,
              then polls to stay current. Real-time, no SEO relevance. */}
          <LiveStock productId={product.id} initialStock={product.stock} />

          <p className="mt-6 leading-relaxed text-ink/90 max-w-prose">{product.description}</p>

          {/* ADD TO CART — client component (state, event handlers). The only
              interactive JS shipped for the core of this page. */}
          <AddToCart
            product={{
              id: product.id,
              name: product.name,
              priceCents: product.priceCents,
              imageUrl: product.imageUrl,
            }}
            maxStock={product.stock}
          />
        </div>
      </div>

      {/* STREAMED: Reviews. An async Server Component behind a Suspense
          boundary. Its (slow) query runs on the server and streams into this
          slot after the core above has already painted. */}
      <section className="mt-20">
        <h2 className="font-display text-2xl mb-6">Reviews</h2>
        <Suspense fallback={<ReviewsSkeleton />}>
          <Reviews productId={product.id} />
        </Suspense>
      </section>

      {/* STREAMED: Recommendations. A SIBLING of Reviews — their fetches run
          concurrently (no data dependency), so neither waits for the other. */}
      <section className="mt-20">
        <h2 className="font-display text-2xl mb-6">More from {product.maker}&apos;s world</h2>
        <Suspense fallback={<RecommendationsSkeleton />}>
          <Recommendations productId={product.id} categoryId={product.categoryId} />
        </Suspense>
      </section>
    </div>
  );
}
