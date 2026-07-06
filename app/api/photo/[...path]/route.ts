import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

// Proxy route that serves images from a PRIVATE Vercel Blob store.
//
// The store is configured with private access — its URLs require the
// read-write token to fetch. next/image (and every anonymous shopper's
// browser) has no token. So we route reads through this handler: it holds
// the token server-side, fetches the blob via the SDK, and streams the
// bytes back with the right content-type and a long cache header.
//
// The pathname carried in the URL is the blob's pathname inside the store.
// It comes from Product.imageUrl (e.g. "/api/photo/products/foo-abc.png").

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const pathname = path.join("/");

  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200) return new NextResponse("Not found", { status: 404 });

  // Product photos are content-addressable (random suffix in the filename),
  // so they can be cached indefinitely by the browser and Next's image
  // optimizer without staleness risk.
  return new Response(result.stream as unknown as BodyInit, {
    headers: {
      "content-type": result.blob.contentType || "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
