// Catalogue page: the full product listing, optionally filtered by category
// via the `?categoria=<id>` query param (set by the homepage's CategoryCard
// links and the filter chips below). Filtering happens server-side, inside
// getProducts() itself — the URL is the single source of truth, so no
// client-side state or "use client" is needed anywhere on this page.
import type { Metadata } from "next";
import { isAdmin } from "@/lib/api/admin";
import { getCategories, getProducts } from "@/lib/api/queries";
import type { Product } from "@/lib/api/types";
import { findVirtualCategory } from "@/lib/virtual-categories";
import { AddCard } from "@/components/admin/AddCard";
import { CatalogueView } from "@/components/CatalogueView";
import { ProductCard } from "@/components/ProductCard";

type SearchParams = Promise<{ categoria?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { categoria } = await searchParams;
  if (!categoria) return { title: "Produtos · AgroMoreira's" };

  const virtual = findVirtualCategory(categoria);
  if (virtual) return { title: `${virtual.name} · AgroMoreira's` };

  const categories = await getCategories();
  const category = categories.find((c) => c.id === Number(categoria));
  return {
    title: category
      ? `${category.name} · AgroMoreira's`
      : "Produtos · AgroMoreira's",
  };
}

/** Fetches the products for the current filter — real category or virtual one. */
async function loadProducts(
  categoria: string | undefined,
): Promise<Product[]> {
  const virtual = findVirtualCategory(categoria);

  if (virtual?.slug === "destaques") {
    return getProducts({ featured: true });
  }
  if (virtual?.slug === "promocoes") {
    // No API filter for discounts, so fetch the catalogue and keep the ones
    // that are on sale.
    const all = await getProducts();
    return all.filter((product) => product.discount_price != null);
  }

  const categoryId = categoria ? Number(categoria) : undefined;
  return getProducts({ categoryId });
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { categoria } = await searchParams;
  const virtual = findVirtualCategory(categoria);
  const categoryId = !virtual && categoria ? Number(categoria) : undefined;

  // `admin` only toggles the edit/remove shortcuts on the cards — the real
  // access control is the API, which rejects the actions without a valid token.
  const [products, categories, admin] = await Promise.all([
    loadProducts(categoria),
    getCategories(),
    isAdmin(),
  ]);

  const activeCategory = categories.find((c) => c.id === categoryId);
  const title = virtual
    ? virtual.name
    : activeCategory
      ? activeCategory.name
      : "Todos os produtos";

  // The "+" card carries a real category being browsed, so the admin create
  // form opens with it chosen; the virtual collections have none to assign.
  const createHref =
    !virtual && categoryId
      ? `/admin/produtos?novo=1&categoria=${categoryId}`
      : "/admin/produtos?novo=1";

  const emptyLabel = virtual
    ? "nesta seleção"
    : activeCategory
      ? "nesta categoria"
      : "disponíveis";

  return (
    <CatalogueView
      categories={categories}
      activeCategory={categoria}
      title={title}
    >
      {products.length > 0 || admin ? (
        // Cards have a target width (~200px) and the grid fits as many columns
        // as the product area allows — so a wide screen gets MORE columns
        // rather than bigger cards, capping each card's size. `auto-fill` (not
        // `auto-fit`) keeps cards small even when a category has few products.
        // Below @md the container is narrow, so a plain 2-column grid is used.
        <div className="grid grid-cols-2 gap-5 @md:[grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
          {admin && <AddCard href={createHref} label="Adicionar produto" />}
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              adminControls={admin}
            />
          ))}
        </div>
      ) : (
        <p className="text-ink-soft">
          Não há produtos {emptyLabel} no momento.
        </p>
      )}
    </CatalogueView>
  );
}
