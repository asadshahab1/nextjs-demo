import Link from "next/link";
import Image from "next/image";
import { getAllProducts, formatPrice } from "@/lib/data";
import type { Metadata } from "next";

// RENDERING STRATEGY: this is the surface where SSG is IRRELEVANT — private,
// per-user, interactive, no SEO. We render the initial product list on the
// server (so the seller sees data immediately) but the route is dynamic and
// noindex; the upload form (next page) is fully client-interactive. A pure-CSR
// shell would be equally valid here.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Seller central", robots: { index: false } };

export default async function SellerPage() {
  const products = await getAllProducts();
  return (
    <div className="mx-auto max-w-content px-5 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl">Seller central</h1>
          <p className="text-smoke mt-1">{products.length} products live</p>
        </div>
        <Link href="/seller/new" className="rounded-full bg-ink text-porcelain px-5 py-2.5 text-sm hover:bg-pine transition-colors">
          Upload product
        </Link>
      </div>

      <div className="rounded-2xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-line/50 text-left text-smoke">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
              <th className="px-4 py-3 font-medium text-right">Price</th>
              <th className="px-4 py-3 font-medium text-right">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <Link href={`/product/${p.id}`} className="flex items-center gap-3 hover:text-pine">
                    <span className="relative w-9 h-9 rounded overflow-hidden bg-line shrink-0">
                      <Image src={p.imageUrl} alt="" fill sizes="36px" className="object-cover" />
                    </span>
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-smoke hidden sm:table-cell">{p.category.name}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPrice(p.priceCents)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
