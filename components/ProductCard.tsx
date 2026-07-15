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

        <span className="absolute bottom-3 left-3 z-10 rounded-full border border-line bg-white/85 px-2.5 py-1 text-xs font-semibold text-ink-soft">
          {product.category.name}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 bg-mist p-4">
        <h3 className="text-lg font-semibold leading-tight">{product.name}</h3>

        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary tabular-nums">
            {formatPrice(onSale ? product.discount_price! : product.price)}
          </span>
          {onSale && (
            <span className="text-sm text-ink-soft line-through tabular-nums">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
