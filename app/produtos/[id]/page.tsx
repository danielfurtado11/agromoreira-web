// Product detail page. Server Component: it loads one product on the server
// and renders a gallery + info. A missing/invalid id shows the 404 page.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getProduct } from "@/lib/api/queries";
import { ProductGallery } from "@/components/ProductGallery";
import { formatPrice } from "@/lib/format";

type Params = Promise<{ id: string }>;

/** Loads the product, turning an invalid id or a 404 into Next's notFound(). */
async function loadProduct(id: string) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  try {
    return await getProduct(numericId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);
  return { title: `${product.name} · AgroMoreira's` };
}

export default async function ProdutoPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = await loadProduct(id);

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
    <div className="mx-auto w-full max-w-[1200px] px-6 py-10">
      <Link
        href="/produtos"
        className="group relative inline-block text-sm font-medium text-ink-soft transition hover:text-primary"
      >
        Voltar ao catálogo
        <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-full" />
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <ProductGallery images={images} name={product.name} />

        <div>
          <Link
            href={`/produtos?categoria=${product.category.id}`}
            className="inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-ink transition hover:bg-accent"
          >
            {product.category.name}
          </Link>

          <h1 className="mt-3 text-3xl font-bold leading-tight">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-3xl font-bold text-primary tabular-nums">
              {formatPrice(onSale ? product.discount_price! : product.price)}
            </span>
            <span className="text-ink-soft">/ {product.unit.name}</span>
            {onSale && (
              <>
                <span className="text-lg text-ink-soft line-through tabular-nums">
                  {formatPrice(product.price)}
                </span>
                <span className="rounded-md bg-accent px-2 py-0.5 text-sm font-bold text-accent-ink">
                  −{discountPercent}%
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-ink-soft">
              {product.description}
            </p>
          )}

          {product.stores.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
                Disponível em
              </h2>
              <ul className="mt-3 space-y-3">
                {product.stores.map((store) => (
                  <li
                    key={store.id}
                    className="rounded-xl border border-line bg-white p-4"
                  >
                    <p className="font-semibold">{store.name}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {store.address}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* There is no cart: ordering happens by phone/email, so point to
              the contacts page from where the visitor decides to buy. */}
          <p className="mt-8 text-sm text-ink-soft">
            Para encomendar este produto,{" "}
            <Link
              href="/contactos"
              className="group relative inline-block font-semibold text-primary"
            >
              contacte-nos
              <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
