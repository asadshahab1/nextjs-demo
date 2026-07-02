import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const IMG = (id: number) => `https://picsum.photos/seed/kiln${id}/800/800`;

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categories = await Promise.all([
    prisma.category.create({ data: { slug: "tableware", name: "Tableware", blurb: "Plates, bowls, and cups thrown for everyday use." } }),
    prisma.category.create({ data: { slug: "vases", name: "Vases & Vessels", blurb: "Sculptural forms for stems, branches, or nothing at all." } }),
    prisma.category.create({ data: { slug: "drinkware", name: "Drinkware", blurb: "Mugs and tumblers with a weight that feels right." } }),
  ]);
  const [tableware, vases, drinkware] = categories;

  const products = [
    { name: "Ridge Dinner Plate", material: "Stoneware", maker: "Ora Vessels", priceCents: 4800, stock: 12, categoryId: tableware.id, description: "A 10-inch plate with a hand-pressed ridge at the rim. Matte oatmeal glaze, food-safe, dishwasher tolerant." },
    { name: "Shallow Serving Bowl", material: "Stoneware", maker: "Ora Vessels", priceCents: 6400, stock: 7, categoryId: tableware.id, description: "Wide, low bowl for salads and roasted things. Speckled clay body under a clear satin glaze." },
    { name: "Fold Side Plate", material: "Porcelain", maker: "Nine Kilns", priceCents: 3600, stock: 20, categoryId: tableware.id, description: "Thin porcelain side plate with a single folded edge. Translucent where the light catches it." },
    { name: "Column Bud Vase", material: "Stoneware", maker: "Marsh Studio", priceCents: 5200, stock: 5, categoryId: vases.id, description: "A tall, narrow column for a single stem. Iron-rich clay left raw on the base." },
    { name: "Tide Vessel", material: "Earthenware", maker: "Marsh Studio", priceCents: 8800, stock: 3, categoryId: vases.id, description: "Rounded vessel with a wavering blue-green glaze that pools toward the foot." },
    { name: "Knot Vase", material: "Stoneware", maker: "Nine Kilns", priceCents: 7400, stock: 6, categoryId: vases.id, description: "A pinched, knotted neck on a heavy round body. Each one resolves the knot differently." },
    { name: "Weight Mug", material: "Stoneware", maker: "Ora Vessels", priceCents: 3200, stock: 24, categoryId: drinkware.id, description: "A 12oz mug with a full-finger handle and a base that sits heavy in the hand. Tenmoku glaze." },
    { name: "Field Tumbler", material: "Porcelain", maker: "Nine Kilns", priceCents: 2800, stock: 18, categoryId: drinkware.id, description: "Stackable porcelain tumbler, unhandled, with a soft-sanded lip. Sold singly." },
    { name: "Ember Cup", material: "Earthenware", maker: "Marsh Studio", priceCents: 3000, stock: 9, categoryId: drinkware.id, description: "Small cup for espresso or tea, glazed in a warm burnt orange that varies kiln to kiln." },
  ];

  let i = 0;
  for (const p of products) {
    i++;
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const created = await prisma.product.create({ data: { ...p, slug, imageUrl: IMG(i) } });
    const nReviews = 2 + (i % 3);
    for (let r = 0; r < nReviews; r++) {
      await prisma.review.create({
        data: {
          productId: created.id,
          author: ["Dana P.", "Sam O.", "Lee R.", "Ari K.", "Nour H."][(i + r) % 5],
          rating: 4 + ((i + r) % 2),
          body: ["Heavier than I expected, in the best way.", "The glaze photos don't do it justice.", "Second one I've bought. Holds up.", "Perfect weight for morning coffee."][(i + r) % 4],
        },
      });
    }
  }

  await prisma.order.create({
    data: {
      userEmail: "demo@kiln.shop",
      totalCents: 8000,
      status: "delivered",
      items: {
        create: [
          { productName: "Weight Mug", priceCents: 3200, quantity: 1 },
          { productName: "Field Tumbler", priceCents: 2800, quantity: 1 },
          { productName: "Ember Cup", priceCents: 3000, quantity: 1 },
        ],
      },
    },
  });

  console.log("Seeded", products.length, "products across", categories.length, "categories.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
