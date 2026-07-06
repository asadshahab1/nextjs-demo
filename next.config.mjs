/** @type {import('next').NextConfig} */
const nextConfig = {
  // IMAGE OPTIMIZATION (next/image): allow remote product photos and serve
  // them re-encoded as AVIF/WebP at device-appropriate widths. This is what
  // shrinks payloads and protects LCP on an image-heavy commerce site.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      // Vercel Blob public URLs — sellers' uploaded photos live here.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    // Widths the optimizer will generate; keep tight to what the layout uses.
    deviceSizes: [360, 640, 828, 1080, 1200, 1920],
    imageSizes: [96, 160, 256, 384],
  },
  experimental: {
    // Partial Prerendering: static shell flushed instantly, dynamic holes
    // stream in. Newer/experimental — safe to disable if your Next version
    // doesn't support it. Demonstrated conceptually on the homepage.
    // ppr: "incremental",
  },
};

export default nextConfig;
