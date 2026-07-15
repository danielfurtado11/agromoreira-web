import type { Product } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";

/**
 * A single product in the catalogue grid: cover image, category, name and
 * price (with the discounted price and a "−%" tag when on sale).
 *
 * Image handling is intentionally simple for now — cover only. Paging through a
 * product's multiple images on hover is added in a later step.
 */
export function ProductCard({ product }: { product: Product }) {
  const cover =
    product.images.find((image) => image.is_cover) ?? product.images[0];

  const onSale = product.discount_price != null;
  const discountPercent = onSale
    ? Math.round(
        (1 - Number(product.discount_price) / Number(product.price)) * 100,
      )
    : 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-mist">
        {cover ? (
          // Product images come from external object storage (MinIO / R2), so
          // we use a plain <img> instead of next/image for now.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-2/5 text-primary/25"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M50 8C30 20 18 40 22 66c2 14 12 24 26 26 0-24-2-44-14-60 18 10 30 28 30 52 14-6 22-22 20-40C102 30 78 14 50 8Z" />
            </svg>
          </div>
        )}

        {onSale && (
          <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-1 text-xs font-bold text-accent-ink">
            −{discountPercent}%
          </span>
        )}

        <span className="absolute bottom-3 left-3 rounded-full border border-line bg-white/85 px-2.5 py-1 text-xs font-semibold text-ink-soft">
          {product.category.name}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
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
