import { ProductGridSkeleton } from "@/components/ui/Skeletons";

// Route-level Suspense fallback shown DURING a navigation to any route that
// doesn't have its own loading.tsx. Kept intentionally generic — a title
// placeholder plus a product grid — because the home and most category-shaped
// routes converge on that shape. Route-specific loaders under app/*/loading.tsx
// override this for pages with distinct layouts.
export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-5 py-12">
      <div className="skeleton h-9 w-64 rounded mb-8" aria-hidden />
      <ProductGridSkeleton />
    </div>
  );
}
