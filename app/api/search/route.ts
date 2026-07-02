import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/data";

// ROUTE HANDLER feeding the client typeahead. Returns lightweight hits.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const hits = await searchProducts(q);
  return NextResponse.json(
    hits.map((h) => ({ id: h.id, name: h.name, category: { name: h.category.name } }))
  );
}
