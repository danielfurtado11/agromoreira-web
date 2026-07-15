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
      className="group flex flex-col justify-between gap-6 rounded-2xl border border-line bg-mist p-6 transition hover:-translate-y-1 hover:border-primary"
    >
      <span className="text-xl font-bold">{category.name}</span>
      <span className="text-sm font-semibold text-primary">
        Ver produtos{" "}
        <span className="inline-block transition-transform group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
