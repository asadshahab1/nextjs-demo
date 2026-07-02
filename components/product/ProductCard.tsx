import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/data";

type CardProduct = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  maker: string;
  category?: { name: string };
};

// SERVER COMPONENT. IMAGE OPTIMIZATION via next/image:
// - explicit width/height reserve space -> no layout shift (CLS).
// - `sizes` tells the optimizer which srcset width to serve at each breakpoint,
//   so phones download small images, not the 800px source.
// - `priority` is passed only for above-the-fold LCP images (see `priority` prop).
export function ProductCard({
  product,
  priority = false,
}: {
  product: CardProduct;
  priority?: boolean;
}) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-line">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-lg leading-snug">{product.name}</h3>
        <span className="tabular-nums text-ink">{formatPrice(product.priceCents)}</span>
      </div>
      <p className="text-sm text-smoke">{product.maker}</p>
    </Link>
  );
}
