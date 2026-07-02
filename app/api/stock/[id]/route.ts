import { NextResponse } from "next/server";
import { getStock } from "@/lib/data";

// ROUTE HANDLER (backend endpoint in the same codebase — full-stack Next.js).
// Feeds the LiveStock client widget's polling. `no-store` so it's never cached.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stock = await getStock(id);
  return NextResponse.json({ stock }, { headers: { "Cache-Control": "no-store" } });
}
