"use client";

// CLIENT COMPONENT: the typeahead. As-you-type suggestions have no SEO value
// and need instant interactivity -> fetched client-side from /api/search.
// Submitting navigates to /search?q=... which is SERVER-rendered (indexable,
// shareable). Two rendering strategies cooperating on one feature.
//
// PERF: we keep an in-session cache of query -> hits so users bouncing between
// the same few queries (backspace + retype, common) get instant results after
// the first hit. We also prefetch the /search page for the current query so
// pressing Enter feels instant instead of waiting on the SSR compile+fetch.

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Hit = { id: string; name: string; category: { name: string } };

// Module-scoped Map: survives component remounts within a page session.
const cache = new Map<string, Hit[]>();

export function SearchBox() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setHits([]);
      setLoading(false);
      return;
    }

    // Cache hit — render immediately, no fetch, no flicker.
    const cached = cache.get(query);
    if (cached) {
      setHits(cached);
      setOpen(true);
      setLoading(false);
      // Still prefetch the search page for the Enter path.
      router.prefetch(`/search?q=${encodeURIComponent(query)}`);
      return;
    }

    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const data: Hit[] = await res.json();
        cache.set(query, data);
        setHits(data);
        setOpen(true);
        setLoading(false);
        router.prefetch(`/search?q=${encodeURIComponent(query)}`);
      } catch {
        /* aborted */
      }
    }, 120); // debounce — tight enough to feel live, loose enough to skip mid-word keystrokes
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, router]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && q.trim()) router.push(`/search?q=${encodeURIComponent(q)}`);
        }}
        placeholder="Search ceramics"
        className="w-40 sm:w-56 rounded-full border border-line bg-white px-4 py-1.5 text-sm focus:border-pine outline-none"
        aria-label="Search"
      />
      {open && (hits.length > 0 || loading) && (
        <ul className="absolute right-0 mt-2 w-72 rounded-xl border border-line bg-white shadow-lg overflow-hidden">
          {hits.slice(0, 6).map((h) => (
            <li key={h.id}>
              <Link
                href={`/product/${h.id}`}
                onClick={() => setOpen(false)}
                className="flex justify-between px-4 py-2.5 text-sm hover:bg-porcelain"
              >
                <span className="text-ink">{h.name}</span>
                <span className="text-smoke">{h.category.name}</span>
              </Link>
            </li>
          ))}
          {loading && hits.length === 0 && (
            <li className="px-4 py-2.5 text-sm text-smoke">Searching…</li>
          )}
        </ul>
      )}
    </div>
  );
}
