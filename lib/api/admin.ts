// Authenticated API access for the admin area.
//
// The token lives in an httpOnly cookie, so only server code (Server
// Components, Server Actions) can read it — which is exactly where these
// helpers are meant to be called from.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOGIN_PATH, SESSION_COOKIE } from "@/lib/auth";
import { ApiError, apiFetch } from "./client";
import type { Post, Product } from "./types";

/** The signed-in admin's token, or null for a visitor. */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Whether an admin is signed in. Used by public pages to decide if they should
 * show the inline editing shortcuts. Only reflects that a cookie is present —
 * never trust it for access control; the API enforces that.
 */
export async function isAdmin(): Promise<boolean> {
  return (await getSessionToken()) !== null;
}

/**
 * Calls the API as the signed-in admin.
 *
 * A missing or rejected (401) token sends the admin to the login page instead
 * of surfacing a raw error — that is what an expired session should feel like.
 */
export async function adminFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await getSessionToken();
  if (!token) redirect(LOGIN_PATH);

  try {
    return await apiFetch<T>(path, {
      ...init,
      headers: { ...init?.headers, Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    // redirect() signals by throwing, so it passes through the re-throw below.
    if (error instanceof ApiError && error.status === 401) redirect(LOGIN_PATH);
    throw error;
  }
}

/**
 * Every product, including the hidden ones — for the panel's list.
 *
 * The API guards `include_inactive` behind a token (403 otherwise), which is
 * why this cannot live with the public queries.
 */
export function getAdminProducts(): Promise<Product[]> {
  return adminFetch<Product[]>("/products?include_inactive=true");
}

/**
 * Every post, including the hidden ones — for the panel's list. `include_
 * inactive` is token-guarded (403 otherwise), like products. A generous limit
 * avoids needing pagination in the panel for this small a feed.
 */
export function getAdminPosts(): Promise<Post[]> {
  return adminFetch<Post[]>("/posts?include_inactive=true&limit=50");
}
