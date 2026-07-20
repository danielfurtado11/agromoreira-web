// Per-resource functions: each one knows its endpoint path and return type.
// Pages call these instead of using `fetch` directly.
import { ApiError, apiFetch } from "./client";
import type {
  AboutUs,
  Announcement,
  Brand,
  Category,
  Employee,
  Post,
  Product,
  ProductDetail,
  Store,
  Unit,
} from "./types";

/**
 * Public catalogue products, with optional filters. Only ever returns visible
 * products — listing hidden ones needs a token, so that lives in
 * `lib/api/admin.ts` instead.
 */
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

/** Units a product can be sold in (kg, saco 25kg, unidade, ...). */
export function getUnits(): Promise<Unit[]> {
  return apiFetch<Unit[]>("/units");
}

/** News feed posts. */
export function getPosts(): Promise<Post[]> {
  return apiFetch<Post[]>("/posts");
}

/** A single news post. */
export function getPost(id: number): Promise<Post> {
  return apiFetch<Post>(`/posts/${id}`);
}

/** Physical stores, with address and opening hours. */
export function getStores(): Promise<Store[]> {
  return apiFetch<Store[]>("/stores");
}

/** Staff members, each with their contact and the store they work at. */
export function getEmployees(): Promise<Employee[]> {
  return apiFetch<Employee[]>("/employees");
}

/**
 * The single "about us" record: description text, contacts and social links.
 * Returns null when it hasn't been filled in yet — the API replies 404 in that
 * case (a fresh production database), and the site must still render rather
 * than crash. Callers treat null as "no content yet".
 */
export async function getAboutUs(): Promise<AboutUs | null> {
  try {
    return await apiFetch<AboutUs>("/about-us");
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Active site-wide announcements (e.g. holiday closures). */
export function getAnnouncements(): Promise<Announcement[]> {
  return apiFetch<Announcement[]>("/announcements");
}

/**
 * Partner brands for the homepage marquee. The API returns only the active
 * ones, already ordered by display_order (managed in the admin).
 */
export function getBrands(): Promise<Brand[]> {
  return apiFetch<Brand[]>("/brands");
}
