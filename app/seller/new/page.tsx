"use client";

// CLIENT COMPONENT: the upload form. On submit it calls the createProduct
// SERVER ACTION, which writes to Postgres AND triggers on-demand revalidation
// of the home + category + product pages. That's the freshness loop: a new
// upload appears on the public ISR pages promptly without a full rebuild —
// the thing that makes ISR viable at high upload volume.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/actions/products";

export default function NewProductPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    priceDollars: "48",
    stock: "10",
    material: "Stoneware",
    maker: "",
    categorySlug: "tableware",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const field = "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-pine outline-none";

  return (
    <div className="mx-auto max-w-lg px-5 py-12">
      <h1 className="font-display text-4xl mb-2">Upload product</h1>
      <p className="text-smoke mb-8">Saving revalidates the storefront pages this product appears on.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm text-smoke">Name</span>
          <input className={field} value={form.name} onChange={set("name")} placeholder="Ridge Dinner Plate" />
        </label>
        <label className="block">
          <span className="text-sm text-smoke">Description</span>
          <textarea className={field} rows={3} value={form.description} onChange={set("description")} />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-smoke">Price (USD)</span>
            <input className={field} type="number" value={form.priceDollars} onChange={set("priceDollars")} />
          </label>
          <label className="block">
            <span className="text-sm text-smoke">Stock</span>
            <input className={field} type="number" value={form.stock} onChange={set("stock")} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-smoke">Material</span>
            <input className={field} value={form.material} onChange={set("material")} />
          </label>
          <label className="block">
            <span className="text-sm text-smoke">Maker</span>
            <input className={field} value={form.maker} onChange={set("maker")} placeholder="Studio name" />
          </label>
        </div>
        <label className="block">
          <span className="text-sm text-smoke">Category</span>
          <select className={field} value={form.categorySlug} onChange={set("categorySlug")}>
            <option value="tableware">Tableware</option>
            <option value="vases">Vases &amp; Vessels</option>
            <option value="drinkware">Drinkware</option>
          </select>
        </label>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          disabled={isPending || !form.name || !form.maker}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const res = await createProduct({
                name: form.name,
                description: form.description || "A handmade piece.",
                priceDollars: Number(form.priceDollars),
                stock: Number(form.stock),
                material: form.material,
                maker: form.maker,
                categorySlug: form.categorySlug,
              });
              if (res.ok) router.push(`/product/${res.id}`);
              else setError(res.error);
            })
          }
          className="w-full rounded-full bg-ink text-porcelain px-6 py-3 text-sm hover:bg-pine transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save & publish"}
        </button>
      </div>
    </div>
  );
}
