import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// DATA ACCESS LAYER
// All DB reads funnel through here so the rendering strategy (which page calls
// what, and when) stays visible in the page files rather than scattered.
//
// NOTE on artificial latency: a couple of functions below sleep briefly. This
// is ONLY to make streaming observable in a demo — the "slow" reviews/recs
// stream in after the fast product content flushes. Delete `delay(...)` for
// real use.
// ---------------------------------------------------------------------------

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

// --- Homepage (ISR): featured products, changes occasionally ---------------
export async function getFeaturedProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { category: true },
  });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

// --- Category page (ISR + generateStaticParams) ----------------------------
export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { products: { orderBy: { createdAt: "desc" }, include: { category: true } } },
  });
}

export async function getAllCategorySlugs() {
  const cats = await prisma.category.findMany({ select: { slug: true } });
  return cats.map((c) => c.slug);
}

// --- Product detail (SSR): the SEO-critical core, fetched per request -------
export async function getProduct(id: string) {
  return prisma.product.findUnique({ where: { id }, include: { category: true } });
}

// --- PDP streamed sections (async Server Components, wrapped in Suspense) ---
export async function getReviews(productId: string) {
  await delay(900); // simulate a slow review service -> streams in after core
  return prisma.review.findMany({ where: { productId }, orderBy: { createdAt: "desc" } });
}

export async function getRecommendations(productId: string, categoryId: string) {
  await delay(1400); // slowest -> flushes last
  return prisma.product.findMany({
    where: { categoryId, id: { not: productId } },
    take: 4,
    include: { category: true },
  });
}

// --- Search (SSR from ?q=) and typeahead (client -> /api/search) -----------
export async function searchProducts(q: string) {
  if (!q.trim()) return [];
  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { material: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { category: true },
    take: 20,
  });
}

// --- Live stock (client polling) -------------------------------------------
export async function getStock(id: string) {
  const p = await prisma.product.findUnique({ where: { id }, select: { stock: true } });
  return p?.stock ?? 0;
}

// --- Account / orders (SSR, personalized) ----------------------------------
export async function getOrdersForUser(email: string) {
  return prisma.order.findMany({
    where: { userEmail: email },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

// --- Seller central (CSR shell reads this) ---------------------------------
export async function getAllProducts() {
  return prisma.product.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } });
}
