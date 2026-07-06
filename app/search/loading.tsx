import { ProductGridSkeleton } from "@/components/ui/Skeletons";

// Search transition skeleton — title placeholder then a grid.
export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-5 py-12" aria-hidden>
      <div className="skeleton h-9 w-72 rounded mb-8" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
