"use server";

// SERVER ACTION: seller uploads a product. After writing, it triggers TARGETED
// on-demand revalidation — the freshness loop that lets the public ISR pages
// (home, the product's category, its PDP) reflect a new upload promptly WITHOUT
// rebuilding the whole site. This is the mechanism that makes ISR viable for a
// high-upload-volume marketplace.
//
// This action takes a FormData because the request includes a file (the
// product photo). The image is uploaded to Vercel Blob (works on serverless
// where the FS is read-only) and the returned public URL is stored in
// Product.imageUrl.

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { getSession } from "@/lib/auth";
import { randomBytes } from "node:crypto";
import { put } from "@vercel/blob";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function createProduct(form: FormData) {
  const session = await getSession();
  if (!session || session.role !== "SELLER") {
    return { ok: false as const, error: "You must be signed in as a seller." };
  }

  const name = String(form.get("name") ?? "").trim();
  const description = String(form.get("description") ?? "").trim() || "A handmade piece.";
  const priceDollars = Number(form.get("priceDollars"));
  const stock = Number(form.get("stock"));
  const material = String(form.get("material") ?? "").trim();
  const maker = String(form.get("maker") ?? "").trim();
  const categorySlug = String(form.get("categorySlug") ?? "");
  const image = form.get("image");

  if (!name || !maker || !material) return { ok: false as const, error: "Name, material, and maker are required." };
  if (!Number.isFinite(priceDollars) || priceDollars < 0) return { ok: false as const, error: "Invalid price." };
  if (!Number.isFinite(stock) || stock < 0) return { ok: false as const, error: "Invalid stock." };

  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) return { ok: false as const, error: "Unknown category." };

  const slug =
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
    "-" +
    randomBytes(2).toString("hex");

  // Image is optional — sellers can skip it and we fall back to a placeholder.
  let imageUrl = `https://picsum.photos/seed/${slug}/800/800`;
  if (image instanceof File && image.size > 0) {
    if (!ALLOWED.has(image.type)) {
      return { ok: false as const, error: "Image must be JPEG, PNG, WebP, or GIF." };
    }
    if (image.size > MAX_BYTES) {
      return { ok: false as const, error: "Image must be 5 MB or smaller." };
    }
    // Upload to Vercel Blob as private. The blob is only fetchable with the
    // read-write token, so we can't drop the raw blob URL into next/image
    // (the browser has no token). We store the pathname and serve reads
    // through /api/photo/[...path], which authenticates with the token
    // server-side and streams the bytes back.
    const blob = await put(`products/${slug}.${EXT[image.type]}`, image, {
      access: "private",
      contentType: image.type,
      addRandomSuffix: true,
    });
    imageUrl = `/api/photo/${blob.pathname}`;
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      priceCents: Math.round(priceDollars * 100),
      stock,
      material,
      maker,
      categoryId: category.id,
      sellerId: session.userId,
      imageUrl,
    },
  });

  // Freshness loop: refresh exactly the pages this upload affects and drop
  // any cached search results so the new product is discoverable immediately.
  revalidatePath("/");
  revalidatePath(`/category/${category.slug}`);
  revalidatePath(`/product/${product.id}`);
  revalidatePath("/seller");
  revalidateTag("products");

  return { ok: true as const, id: product.id };
}
