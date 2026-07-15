// Homepage — work in progress (Phase 2).
// For now it renders the featured & discounted products; the other sections
// (posts carousel, categories, header/footer) are added in the next steps.
import { getProducts } from "@/lib/api/queries";
import { ProductCard } from "@/components/ProductCard";

export default async function Home() {
  const products = await getProducts();
  const highlights = products.filter(
    (product) => product.is_featured || product.discount_price != null,
  );

  return (
    <main className="mx-auto w-full max-w-[1440px] px-6 py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-ink">
          Em destaque &amp; promoções
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Escolhas da casa</h1>
      </header>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {highlights.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
