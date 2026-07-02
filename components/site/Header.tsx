import Link from "next/link";
import { getCategories } from "@/lib/data";
import { CartBadge } from "@/components/site/CartBadge";
import { SearchBox } from "@/components/site/SearchBox";

// SERVER COMPONENT: fetches the category nav on the server, ships no JS for
// itself. Only the two genuinely interactive leaves (CartBadge, SearchBox)
// are Client Components. This is the server/client split in miniature.
export async function Header() {
  const categories = await getCategories();
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
        <div className="ml-auto flex items-center gap-4">
          <SearchBox />
          <Link href="/seller" className="text-sm text-smoke hover:text-ink transition-colors hidden sm:block">
            Seller
          </Link>
          <CartBadge />
        </div>
      </div>
    </header>
  );
}
