// Seller central transition skeleton — a header row + 5 rows of the seller's
// product table.
export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-5 py-12" aria-hidden>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="skeleton h-9 w-56 rounded mb-2" />
          <div className="skeleton h-4 w-32 rounded" />
        </div>
        <div className="skeleton h-10 w-36 rounded-full" />
      </div>
      <div className="rounded-2xl border border-line overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-line last:border-b-0">
            <div className="skeleton w-9 h-9 rounded shrink-0" />
            <div className="skeleton h-4 flex-1 max-w-[220px] rounded" />
            <div className="skeleton h-4 w-24 rounded hidden sm:block" />
            <div className="skeleton h-4 w-14 rounded" />
            <div className="skeleton h-4 w-10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
