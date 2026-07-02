"use server";

// SERVER ACTION: seller uploads a product. After writing, it triggers TARGETED
// on-demand revalidation — the freshness loop that lets the public ISR pages
// (home, the product's category, its PDP) reflect a new upload promptly WITHOUT
// rebuilding the whole site. This is the mechanism that makes ISR viable for a
// high-upload-volume marketplace.

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProduct(input: {
  name: string;
  description: string;
  priceDollars: number;
  stock: number;
  material: string;
  maker: string;
  categorySlug: string;
}) {
  const category = await prisma.category.findUnique({ where: { slug: input.categorySlug } });
  if (!category) return { ok: false as const, error: "Unknown category." };

  const slug =
    input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 6);

  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      priceCents: Math.round(input.priceDollars * 100),
      stock: input.stock,
      material: input.material,
      maker: input.maker,
      categoryId: category.id,
      imageUrl: `https://picsum.photos/seed/${slug}/800/800`,
    },
  });

  // Freshness loop: refresh exactly the pages this upload affects.
  revalidatePath("/");
  revalidatePath(`/category/${category.slug}`);
  revalidatePath(`/product/${product.id}`);

  return { ok: true as const, id: product.id };
}
