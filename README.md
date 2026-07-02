# Kiln — a Next.js rendering-strategy showcase

A small but complete e-commerce MVP whose real purpose is to demonstrate, in one
codebase, **every rendering strategy applied to the surface it actually fits** —
the thesis that a meta-framework like Next.js lets you pick per route rather than
globally. Store: a marketplace for handmade ceramics.

Stack: Next.js 15 (App Router) · React 19 · Prisma · Vercel Postgres · Tailwind.

---

## The concept map (what demonstrates what, and why)

| Surface | File | Strategy | Why it fits / what it buys |
|---|---|---|---|
| Homepage | `app/page.tsx` | **ISR** (`revalidate = 60`) | Public, SEO, changes periodically not per-user → static from the edge, refreshed in background. Best TTFB/LCP on the top entry point without rebuilds. Also streams a below-fold section via `<Suspense>`. |
| Category | `app/category/[slug]/page.tsx` | **ISR + `generateStaticParams` + `dynamicParams`** | Many public SEO pages whose product sets change. Pre-build known ones, generate the rest on-demand, revalidate on a timer. No full rebuild to add categories. |
| Product (PDP) | `app/product/[id]/page.tsx` | **SSR core + streaming + client leaves** | High upload volume ⇒ can't pre-build in time; SEO ⇒ content must be in server HTML. Core rendered per request (indexable instantly); `<Reviews>` and `<Recommendations>` stream in; interactive bits are client. The centerpiece. |
| Reviews / Recs | `components/product/Reviews.tsx`, `Recommendations.tsx` | **Async Server Components in `<Suspense>`** | Slow queries stream in after the core paints. Siblings ⇒ their fetches run **concurrently** (no waterfall). Ship zero client JS. |
| Add to cart / qty | `components/product/AddToCart.tsx` | **Client Component** | Needs state + handlers. `+`/`−` update local state instantly — no server round-trip, no regeneration. |
| Live stock | `components/product/LiveStock.tsx` + `app/api/stock/[id]/route.ts` | **Client polling** | Real-time value, no SEO relevance → initial value in server HTML, then polled client-side (swap for WebSocket/SSE identically). |
| Search results | `app/search/page.tsx` | **SSR from `?q=`** | Query-dependent (nothing to pre-build), but results should be in the HTML (shareable/indexable). |
| Typeahead | `components/site/SearchBox.tsx` + `app/api/search/route.ts` | **Client-side fetch** | As-you-type suggestions: no SEO, needs instant interactivity. Two strategies on one feature. |
| Cart | `app/cart/page.tsx` + `lib/cart-store.tsx` | **CSR** | Per-user, no SEO → client state. |
| Checkout | `app/checkout/page.tsx` + `app/actions/orders.ts` | **Client + Server Action** | Private. Order persisted via a Server Action (no hand-written API). Payment would hand off to a hosted provider — no card data touches the app. |
| Account / orders | `app/account/orders/page.tsx` | **SSR, personalized** | Per-user data, correct on first paint → server-rendered per request. |
| Seller central | `app/seller/page.tsx`, `app/seller/new/page.tsx` | **Where SSG is irrelevant** | Private, per-user, interactive, no SEO. Upload form calls `app/actions/products.ts`, which writes **and** triggers on-demand revalidation of the public ISR pages — the freshness loop that makes ISR viable at scale. |

### Cross-cutting optimizations
- **Fonts** — `app/layout.tsx`: `next/font` self-hosts + subsets Fraunces/Inter, `display: swap`, auto fallback metrics ⇒ no render-blocking request, no CLS.
- **Images** — `next/image` throughout: `fill` + `sizes` for responsive srcset, AVIF/WebP (`next.config.mjs`), explicit dimensions ⇒ no CLS, `priority` only on above-the-fold LCP images.
- **Prefetching** — every `<Link>` prefetches in-viewport routes in production ⇒ near-instant soft navigation.
- **Server/Client split** — Server Components by default; `"use client"` only at interactive leaves ⇒ minimal JS shipped, faster INP.
- **Caching stack** — router cache (instant back-nav) → CDN edge (ISR) → origin; seller writes revalidate targeted paths.

### Metrics each choice moves
TTFB/LCP ← ISR-from-edge + `next/image priority` · FCP ← streaming · CLS ← `next/font` + sized images · INP/TBT ← Server-Component JS reduction · SEO ← real content in server HTML on every public surface.

---

## Setup

```bash
npm install

# 1) Connect Vercel Postgres. In the Vercel dashboard: Storage → your Postgres
#    → .env.local tab. Copy DATABASE_URL (pooled) and DIRECT_URL (direct) into
#    a local .env file (see .env.example).
cp .env.example .env   # then paste your real values

# 2) Generate the Prisma client (creates all TS types — do this before tsc/dev)
npx prisma generate

# 3) Create tables and seed sample ceramics
npx prisma db push
npm run db:seed

# 4) Run
npm run dev
```

> Note: a freshly cloned Prisma project has **no types** until `npx prisma generate`
> runs — that's normal. `tsc` will report implicit-`any` on query results until then.

## Try the concepts live
- **Streaming**: open a PDP (`/product/…`) — the core paints immediately, reviews
  then recs pop in (the data layer adds artificial delay to make this visible;
  remove `delay(...)` in `lib/data.ts` for production).
- **ISR freshness loop**: go to `/seller/new`, publish a product, then check the
  homepage and its category — it appears without a rebuild (on-demand revalidation).
- **Client vs. static**: on a PDP, `+`/`−` and add-to-cart update instantly with
  no navigation; the product content is still in `view-source` (server HTML).
- **Live value**: `LiveStock` polls `/api/stock/[id]` every 5s while the page HTML
  stays put.

## Deploy
Push to a repo and import into Vercel. Set `DATABASE_URL` / `DIRECT_URL` env vars,
add the Postgres integration, and the `build` script runs `prisma generate` first.
