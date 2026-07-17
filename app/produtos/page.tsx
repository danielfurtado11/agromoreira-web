// Catalogue page: the full product listing, optionally filtered by category
// via the `?categoria=<id>` query param (set by the homepage's CategoryCard
// links and the filter chips below). Filtering happens server-side, inside
// getProducts() itself — the URL is the single source of truth, so no
// client-side state or "use client" is needed anywhere on this page.
import type { Metadata } from "next";
import { isAdmin } from "@/lib/api/admin";
import { getCategories, getProducts } from "@/lib/api/queries";
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

  const categories = await getCategories();
  const category = categories.find((c) => c.id === Number(categoria));
  return {
    title: category
      ? `${category.name} · AgroMoreira's`
      : "Produtos · AgroMoreira's",
  };
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { categoria } = await searchParams;
  const categoryId = categoria ? Number(categoria) : undefined;

  // `admin` only toggles the edit/remove shortcuts on the cards — the real
  // access control is the API, which rejects the actions without a valid token.
  const [products, categories, admin] = await Promise.all([
    getProducts({ categoryId }),
    getCategories(),
    isAdmin(),
  ]);

  const activeCategory = categories.find((c) => c.id === categoryId);

  return (
    <CatalogueView
      categories={categories}
      activeCategoryId={categoryId}
      title={activeCategory ? activeCategory.name : "Todos os produtos"}
    >
      {products.length > 0 ? (
        // Cards have a target width (~200px) and the grid fits as many columns
        // as the product area allows — so a wide screen gets MORE columns
        // rather than bigger cards, capping each card's size. `auto-fill` (not
        // `auto-fit`) keeps cards small even when a category has few products.
        // Below @md the container is narrow, so a plain 2-column grid is used.
        <div className="grid grid-cols-2 gap-5 @md:[grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
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
          Não há produtos {activeCategory ? "nesta categoria" : "disponíveis"} no
          momento.
        </p>
      )}
    </CatalogueView>
  );
}
