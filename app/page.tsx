// Homepage. Order: latest posts → featured & discounted products → categories.
import Link from "next/link";
import { getCategories, getPosts, getProducts } from "@/lib/api/queries";
import { VIRTUAL_CATEGORIES } from "@/lib/virtual-categories";
import { CategoryCard } from "@/components/CategoryCard";
import { PostCarousel } from "@/components/PostCarousel";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";

export default async function Home() {
  const [posts, products, categories] = await Promise.all([
    getPosts(),
    getProducts(),
    getCategories(),
  ]);

  const recentPosts = posts.slice(0, 5);
  const highlights = products.filter(
    (product) => product.is_featured || product.discount_price != null,
  );

  return (
    <div className="mx-auto w-full max-w-[1800px] px-6">
      {/* Visually hidden page title for SEO / screen readers. */}
      <h1 className="sr-only">
        AgroMoreira&apos;s — agricultura, ferragens, rações e produtos de limpeza
      </h1>

      {recentPosts.length > 0 && (
        <section className="py-10">
          {/* Cap the carousel width so it does not become oversized on large
              screens (same idea as the product cards). The "see all" link is
              inside the same cap, so it stays aligned to the carousel edge. */}
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex justify-end">
              <Link
                href="/novidades"
                className="group relative inline-block text-sm font-semibold text-primary"
              >
                Todas as novidades
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            </div>
            <PostCarousel posts={recentPosts} />
          </div>
        </section>
      )}

      <section className="border-t border-line py-12">
        <SectionHeading
          eyebrow="Em destaque & promoções"
          title="Escolhas da casa"
          link={{ href: "/produtos", label: "Ver catálogo" }}
        />
        {/* Same capped card sizing as the catalogue: ~200px cards, as many
            columns as fit, so cards never blow up on large screens. */}
        <div className="grid grid-cols-2 gap-5 sm:[grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
          {highlights.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="border-t border-line py-12">
        <SectionHeading
          eyebrow="Categorias"
          title="Encontre o que precisa"
          link={{ href: "/categorias", label: "Ver tudo" }}
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {VIRTUAL_CATEGORIES.map((virtual) => (
            <CategoryCard
              key={virtual.slug}
              href={`/produtos?categoria=${virtual.slug}`}
              label={virtual.name}
              highlight
            />
          ))}
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              href={`/produtos?categoria=${category.id}`}
              label={category.name}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
