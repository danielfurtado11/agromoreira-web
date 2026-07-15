// Per-resource functions: each one knows its endpoint path and return type.
// Pages call these instead of using `fetch` directly.
import { apiFetch } from "./client";
import type {
  AboutUs,
  Announcement,
  Category,
  Post,
  Product,
  ProductDetail,
  Store,
} from "./types";

/** Public catalogue products, with optional filters. */
export function getProducts(params?: {
  categoryId?: number;
  featured?: boolean;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.categoryId) query.set("category_id", String(params.categoryId));
  if (params?.featured) query.set("is_featured", "true");

  const suffix = query.toString() ? `?${query}` : "";
  return apiFetch<Product[]>(`/products${suffix}`);
}

/** A single product's detail, including the stores where it is available. */
export function getProduct(id: number): Promise<ProductDetail> {
  return apiFetch<ProductDetail>(`/products/${id}`);
}

/** All categories (the site navigation is built from these). */
export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories");
}

/** News feed posts. */
export function getPosts(): Promise<Post[]> {
  return apiFetch<Post[]>("/posts");
}

/** Physical stores, with address and opening hours. */
export function getStores(): Promise<Store[]> {
  return apiFetch<Store[]>("/stores");
}

/** The single "about us" record: description text, contacts and social links. */
export function getAboutUs(): Promise<AboutUs> {
  return apiFetch<AboutUs>("/about-us");
}

/** Active site-wide announcements (e.g. holiday closures). */
export function getAnnouncements(): Promise<Announcement[]> {
  return apiFetch<Announcement[]>("/announcements");
}
