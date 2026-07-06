import Link from "next/link";
import { getCategories } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { CartBadge } from "@/components/site/CartBadge";
import { SearchBox } from "@/components/site/SearchBox";
import { logout } from "@/app/actions/auth";

// SERVER COMPONENT: fetches the category nav and the current session on the
// server, ships no JS for itself. Only the two genuinely interactive leaves
// (CartBadge, SearchBox) are Client Components. This is the server/client
// split in miniature.
export async function Header() {
  const [categories, session] = await Promise.all([getCategories(), getSession()]);
  return (
    <header className="border-b border-line bg-porcelain/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-content px-5 h-16 flex items-center gap-6">
        <Link href="/" className="font-display text-2xl font-600 tracking-tight">
          Kiln
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-smoke">
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="hover:text-ink transition-colors">
              {c.name}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <SearchBox />
          {session?.role === "SELLER" && (
            <Link href="/seller" className="text-smoke hover:text-ink transition-colors hidden sm:block">
              Seller central
            </Link>
          )}
          {session?.role === "BUYER" && (
            <Link href="/account/orders" className="text-smoke hover:text-ink transition-colors hidden sm:block">
              Orders
            </Link>
          )}
          {session ? (
            <form action={logout}>
              <span className="text-smoke hidden md:inline mr-3">{session.email}</span>
              <button type="submit" className="text-smoke hover:text-ink transition-colors">
                Sign out
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login/buyer" className="text-smoke hover:text-ink transition-colors">
                Buyer
              </Link>
              <span className="text-line">·</span>
              <Link href="/login/seller" className="text-smoke hover:text-ink transition-colors">
                Seller
              </Link>
            </div>
          )}
          <CartBadge />
        </div>
      </div>
    </header>
  );
}
