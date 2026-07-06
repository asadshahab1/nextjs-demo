// Cart transition skeleton — 3 line-item rows and a totals block.
export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-5 py-12" aria-hidden>
      <div className="skeleton h-10 w-40 rounded mb-8" />
      <div className="grid md:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-line p-4">
              <div className="skeleton w-20 h-20 rounded-lg shrink-0" />
              <div className="flex-1">
                <div className="skeleton h-4 w-2/3 rounded mb-2" />
                <div className="skeleton h-3 w-1/3 rounded" />
              </div>
              <div className="skeleton h-8 w-20 rounded-full" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-line p-5 h-fit">
          <div className="skeleton h-4 w-24 rounded mb-4" />
          <div className="skeleton h-3 w-full rounded mb-2" />
          <div className="skeleton h-3 w-full rounded mb-2" />
          <div className="skeleton h-10 w-full rounded-full mt-4" />
        </div>
      </div>
    </div>
  );
}
