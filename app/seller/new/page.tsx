"use client";

// CLIENT COMPONENT: the upload form. On submit it builds a FormData from the
// controlled inputs + the file input, then calls the createProduct SERVER
// ACTION. The action writes the row to Postgres, saves the photo under
// public/uploads/, AND triggers on-demand revalidation of the home + category
// + product pages. That's the freshness loop: a new upload appears on the
// public ISR pages promptly without a full rebuild.
//
// NOTE: we deliberately do NOT use a <form> element here. Next auto-wires
// imported server actions into any surrounding <form> for progressive
// enhancement — which submits the form natively before our JS handler can
// preventDefault. Building the FormData imperatively side-steps that.

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/actions/products";

export default function NewProductPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
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

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const field = "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-pine outline-none";

  const submit = () => {
    startTransition(async () => {
      setError(null);
      const fd = new FormData();
      for (const [k, v] of Object.entries(form)) fd.set(k, v);
      const file = fileRef.current?.files?.[0];
      if (file) fd.set("image", file);
      const res = await createProduct(fd);
      if (res.ok) router.push(`/product/${res.id}`);
      else setError(res.error);
    });
  };

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

        <label className="block">
          <span className="text-sm text-smoke">Photo</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={onImage}
            className="block w-full text-sm text-smoke file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-porcelain hover:file:bg-pine"
          />
          <span className="text-xs text-smoke mt-1 block">Optional. JPEG/PNG/WebP/GIF, up to 5 MB. A placeholder is used if you skip this.</span>
        </label>

        {preview && (
          <div className="rounded-lg border border-line p-3">
            <p className="text-xs text-smoke mb-2">Preview</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="max-h-56 rounded" />
          </div>
        )}

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="button"
          disabled={isPending || !form.name || !form.maker}
          onClick={submit}
          className="w-full rounded-full bg-ink text-porcelain px-6 py-3 text-sm hover:bg-pine transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save & publish"}
        </button>
      </div>
    </div>
  );
}
