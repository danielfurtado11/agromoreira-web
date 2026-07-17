// Fixed, code-defined "collections" that behave like categories in the
// navigation but are NOT stored in the database. Each gathers products by a
// rule (featured, on sale) rather than by assignment, so they always exist,
// never need a product pointed at them, and cannot be removed through the admin
// (they simply are not part of the categories CRUD).
//
// They are addressed on the catalogue by a slug in the `?categoria=` param
// (e.g. /produtos?categoria=promocoes) instead of a numeric id.

export type VirtualCategorySlug = "destaques" | "promocoes";

export type VirtualCategory = {
  slug: VirtualCategorySlug;
  name: string;
};

export const VIRTUAL_CATEGORIES: VirtualCategory[] = [
  { slug: "destaques", name: "Destaques" },
  { slug: "promocoes", name: "Promoções" },
];

/** Resolves a raw `?categoria=` value to a virtual category, if it is one. */
export function findVirtualCategory(
  slug: string | undefined,
): VirtualCategory | undefined {
  return VIRTUAL_CATEGORIES.find((category) => category.slug === slug);
}
