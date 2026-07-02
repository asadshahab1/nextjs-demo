import Link from "next/link";
import { Suspense } from "react";
import { getFeaturedProducts, getCategories } from "@/lib/data";
import { ProductCard } from "@/components/product/ProductCard";
import { RecommendationsSkeleton } from "@/components/ui/Skeletons";

// RENDERING STRATEGY: ISR.
// The homepage is public and SEO-relevant, but its content (featured products,
// categories) changes periodically — not per-user, not per-second. So it's
// statically generated and served from the CDN edge on every request, then
// regenerated in the background at most once per `revalidate` window.
// Payoff: best-possible TTFB/LCP on the highest-traffic entry point, without
// rebuilding the site whenever a new product is featured.
export const revalidate = 60; // seconds (stale-while-revalidate)

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(), getCategories()]);

  return (
    <div className="mx-auto max-w-content px-5">
      {/* HERO — the thesis: the material itself. */}
      <section className="py-16 md:py-24 grid md:grid-cols-[1.1fr_1fr] gap-10 items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-pine mb-4">Thrown, not stamped</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05]">
            Ceramics with the maker&apos;s hand still in them.
          </h1>
          <p className="mt-5 text-lg text-smoke max-w-md">
            A small marketplace for stoneware, porcelain, and earthenware from independent studios.
            No two are identical — that&apos;s the point.
          </p>
          <Link
            href={`/category/${categories[0]?.slug ?? "tableware"}`}
            className="inline-block mt-7 rounded-full bg-ink text-porcelain px-6 py-3 text-sm hover:bg-pine transition-colors"
          >
            Browse the collection
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {featured.slice(0, 2).map((p, i) => (
            // The first images are above the fold -> priority for LCP.
            <ProductCard key={p.id} product={p} priority={i === 0} />
          ))}
        </div>
      </section>

      {/* FEATURED GRID — part of the static payload. */}
      <section className="py-8">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl">New this week</h2>
          <span className="text-sm text-smoke">Updated hourly</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* STREAMED SECTION — demonstrates Suspense on the homepage: the section
          below flushes its fallback immediately and streams in when ready, so
          it never delays first paint of the hero + grid above. */}
      <section className="py-12">
        <h2 className="font-display text-2xl mb-6">Studios to know</h2>
        <Suspense fallback={<RecommendationsSkeleton />}>
          <StudioRail />
        </Suspense>
      </section>
    </div>
  );
}

// An async Server Component streamed inside the Suspense boundary above.
async function StudioRail() {
  const featured = await getFeaturedProducts();
  const makers = Array.from(new Set(featured.map((p) => p.maker)));
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {makers.map((maker) => (
        <div key={maker} className="rounded-2xl border border-line p-6">
          <h3 className="font-display text-xl">{maker}</h3>
          <p className="text-sm text-smoke mt-1">
            {featured.filter((p) => p.maker === maker).length} pieces in the shop
          </p>
        </div>
      ))}
    </div>
  );
}
