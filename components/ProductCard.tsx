import type { Product } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";
import { ProductImages } from "./ProductImages";

/**
 * A single product in the catalogue grid: image(s), category, name and price
 * (with the discounted price and a "−%" tag when on sale).
 */
export function ProductCard({ product }: { product: Product }) {
  // Cover image first, then the rest by their stored position.
  const images = [...product.images].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.position - b.position,
  );

  const onSale = product.discount_price != null;
  const discountPercent = onSale
    ? Math.round(
        (1 - Number(product.discount_price) / Number(product.price)) * 100,
      )
    : 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-mist">
        <ProductImages images={images} name={product.name} />

        {onSale && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-accent px-2 py-1 text-xs font-bold text-accent-ink">
            −{discountPercent}%
          </span>
        )}

        <span className="absolute bottom-3 left-3 z-10 rounded-full border bg-white/60 px-2.5 py-1 text-xs font-semibold text-ink-soft">
          {product.category.name}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 bg-mist p-3.5">
        <h3 className="text-sm font-semibold leading-tight">{product.name}</h3>

        <div className="mt-auto flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="text-lg font-bold text-primary tabular-nums">
            {formatPrice(onSale ? product.discount_price! : product.price)}
          </span>
          <span className="text-xs text-ink-soft">/ {product.unit.name}</span>
          {onSale && (
            <span className="text-xs text-ink-soft line-through tabular-nums">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
