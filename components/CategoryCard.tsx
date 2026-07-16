import Link from "next/link";
import type { Category } from "@/lib/api/types";

/**
 * A category entry point on the homepage. Name only (the model has no
 * description) and a link to the catalogue filtered by this category.
 */
export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/produtos?categoria=${category.id}`}
      className="flex min-h-24 items-center justify-center rounded-2xl border border-line bg-mist p-6 text-center text-lg font-bold transition hover:-translate-y-1 hover:border-primary"
    >
      {category.name}
    </Link>
  );
}
