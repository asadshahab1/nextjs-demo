import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, getAllCategorySlugs } from "@/lib/data";
import { ProductCard } from "@/components/product/ProductCard";

// RENDERING STRATEGY: ISR with on-demand generation.
// Category pages are public and SEO-important, there are many of them, and
// their product sets change as sellers upload. So:
//  - generateStaticParams pre-builds the known categories at deploy time.
//  - revalidate refreshes them on a timer (and seller uploads trigger targeted
//    on-demand revalidation of the affected category — see app/actions/products.ts).
//  - dynamicParams=true means a category not pre-built still renders on first
//    request and is then cached (on-demand generation), so we never need a full
//    rebuild to add categories.
export const revalidate = 120;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

// METADATA API: per-category title/description for SEO + social previews.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Not found" };
  return {
    title: category.name,
    description: category.blurb,
    openGraph: { title: `${category.name} · Kiln`, description: category.blurb },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // Next 15: params is async
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-content px-5 py-12">
      <header className="max-w-xl mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-pine mb-3">Category</p>
        <h1 className="font-display text-4xl md:text-5xl">{category.name}</h1>
        <p className="mt-3 text-lg text-smoke">{category.blurb}</p>
      </header>

      {category.products.length === 0 ? (
        <p className="text-smoke">No pieces in this category yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
          {category.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
