// PDP transition skeleton. Mirrors the SSR shell — square photo on the left,
// title / price / description on the right — so the layout doesn't shift when
// the real content arrives.
export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-5 py-8" aria-hidden>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="skeleton aspect-square rounded-2xl" />
        <div>
          <div className="skeleton h-4 w-24 rounded mb-3" />
          <div className="skeleton h-10 w-3/4 rounded mb-4" />
          <div className="skeleton h-6 w-24 rounded mb-6" />
          <div className="skeleton h-3 w-full rounded mb-1.5" />
          <div className="skeleton h-3 w-full rounded mb-1.5" />
          <div className="skeleton h-3 w-2/3 rounded mb-8" />
          <div className="skeleton h-11 w-40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
