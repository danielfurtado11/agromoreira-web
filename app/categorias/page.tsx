// Categories page: shows every category as a matrix of buttons. Picking one
// leads to the catalogue filtered by that category — the CategoryCard already
// links to /produtos?categoria=<id>, so this page is just the full grid.
import type { Metadata } from "next";
import { isAdmin } from "@/lib/api/admin";
import { getCategories } from "@/lib/api/queries";
import { VIRTUAL_CATEGORIES } from "@/lib/virtual-categories";
import { AddCard } from "@/components/admin/AddCard";
import { CategoryCard } from "@/components/CategoryCard";

export const metadata: Metadata = {
  title: "Categorias · AgroMoreira's",
};

export default async function CategoriasPage() {
  const [categories, admin] = await Promise.all([getCategories(), isAdmin()]);

  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 py-10">
      <h1 className="text-3xl font-bold">Categorias</h1>
      <p className="mt-2 text-ink-soft">
        Escolha uma categoria para ver os produtos.
      </p>

      {/* Capped button size, as many columns as fit — same approach as the
          product grids, so cards never blow up on large screens. */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:[grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
        {/* Fixed collections first, tinted so they stand apart. */}
        {VIRTUAL_CATEGORIES.map((virtual) => (
          <CategoryCard
            key={virtual.slug}
            href={`/produtos?categoria=${virtual.slug}`}
            label={virtual.name}
            highlight
          />
        ))}
        {admin && (
          <AddCard href="/admin/categorias" label="Adicionar categoria" />
        )}
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            href={`/produtos?categoria=${category.id}`}
            label={category.name}
          />
        ))}
      </div>
    </div>
  );
}
