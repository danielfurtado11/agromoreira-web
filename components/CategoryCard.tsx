import Link from "next/link";

/**
 * A category entry point (homepage and /categorias grids), linking to the
 * catalogue filtered by it. Takes a plain href + label so it serves both real
 * categories and the fixed virtual ones (Destaques, Promoções); `highlight`
 * tints the latter so they read as special collections rather than a normal
 * category.
 */
export function CategoryCard({
  href,
  label,
  highlight = false,
}: {
  href: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-24 items-center justify-center rounded-2xl border p-6 text-center text-lg font-bold transition hover:-translate-y-1 hover:border-primary ${
        highlight
          ? "border-accent/40 bg-accent-soft text-accent-ink"
          : "border-line bg-mist"
      }`}
    >
      {label}
    </Link>
  );
}
