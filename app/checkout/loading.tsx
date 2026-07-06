// Checkout transition skeleton — address form skeleton + order summary.
export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-5 py-12" aria-hidden>
      <div className="skeleton h-10 w-40 rounded mb-8" />
      <div className="grid md:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton h-3 w-20 rounded mb-2" />
              <div className="skeleton h-10 w-full rounded-lg" />
            </div>
          ))}
          <div className="skeleton h-11 w-40 rounded-full mt-2" />
        </div>
        <div className="rounded-xl border border-line p-5 h-fit">
          <div className="skeleton h-4 w-32 rounded mb-4" />
          <div className="skeleton h-3 w-full rounded mb-2" />
          <div className="skeleton h-3 w-full rounded mb-2" />
          <div className="skeleton h-3 w-2/3 rounded mb-4" />
          <div className="skeleton h-6 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}
