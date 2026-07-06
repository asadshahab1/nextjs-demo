// Orders transition skeleton — 3 order-card placeholders.
export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12" aria-hidden>
      <div className="skeleton h-10 w-48 rounded mb-2" />
      <div className="skeleton h-4 w-64 rounded mb-10" />
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-line p-5">
            <div className="flex justify-between items-baseline">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-4 w-16 rounded" />
            </div>
            <div className="skeleton h-3 w-28 rounded mt-2" />
            <div className="mt-4 space-y-2">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-5/6 rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
            <div className="flex justify-between mt-4 pt-3 border-t border-line">
              <div className="skeleton h-4 w-12 rounded" />
              <div className="skeleton h-4 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
