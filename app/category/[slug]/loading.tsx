import { ProductGridSkeleton } from "@/components/ui/Skeletons";

// Category transition skeleton — matches the category page shell: page title,
// blurb, then the product grid.
export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-5 py-12" aria-hidden>
      <div className="skeleton h-10 w-64 rounded mb-3" />
      <div className="skeleton h-4 w-96 max-w-full rounded mb-10" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
