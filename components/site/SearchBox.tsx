"use client";

// CLIENT COMPONENT: the typeahead. As-you-type suggestions have no SEO value
// and need instant interactivity -> fetched client-side from /api/search.
// Submitting navigates to /search?q=... which is SERVER-rendered (indexable,
// shareable). Two rendering strategies cooperating on one feature.

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Hit = { id: string; name: string; category: { name: string } };

export function SearchBox() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q.trim()) {
      setHits([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        setHits(await res.json());
        setOpen(true);
      } catch {
        /* aborted */
      }
    }, 150); // debounce
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

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
      {open && hits.length > 0 && (
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
        </ul>
      )}
    </div>
  );
}
