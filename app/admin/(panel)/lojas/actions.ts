"use server";

import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Store } from "@/lib/api/types";
import type { ActionResult } from "@/lib/admin";
import { WEEKDAY_ORDER } from "@/lib/opening-hours";

/**
 * Create and update also report the saved store, so the window can move
 * straight on to the photo without waiting for the list to refresh.
 */
export type StoreActionResult = ActionResult & { store?: Store };

/**
 * Store info (address, opening hours) is rendered by the footer on every
 * page, so a change must revalidate the whole tree — not a list of paths
 * that would go stale the moment a page is added.
 */
function revalidateStores() {
  revalidatePath("/", "layout");
}

function messageFor(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}

/**
 * Builds the opening-hours object from the seven per-day fields. Days left
 * empty are omitted (the site simply does not list them), and a form with
 * every day empty means "no hours at all" — null, like the API expects.
 */
function readOpeningHours(formData: FormData): Record<string, string> | null {
  const hours: Record<string, string> = {};
  for (const day of WEEKDAY_ORDER) {
    const value = String(formData.get(`hours_${day}`) ?? "").trim();
    if (value) hours[day] = value;
  }
  return Object.keys(hours).length > 0 ? hours : null;
}

/** Reads the form once; create and update share exactly the same fields. */
function readForm(
  formData: FormData,
):
  | { name: string; address: string; opening_hours: Record<string, string> | null }
  | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "O nome não pode estar vazio." };

  const address = String(formData.get("address") ?? "").trim();
  if (!address) return { error: "A morada não pode estar vazia." };

  return { name, address, opening_hours: readOpeningHours(formData) };
}

export async function createStore(
  formData: FormData,
): Promise<StoreActionResult> {
  const payload = readForm(formData);
  if ("error" in payload) return payload;

  try {
    const created = await adminFetch<Store>("/stores", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    revalidateStores();
    return { store: created };
  } catch (error) {
    return { error: messageFor(error, "Não foi possível criar a loja.") };
  }
}

export async function updateStore(
  formData: FormData,
): Promise<StoreActionResult> {
  const id = Number(formData.get("id"));
  const payload = readForm(formData);
  if ("error" in payload) return payload;

  try {
    const saved = await adminFetch<Store>(`/stores/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    revalidateStores();
    return { store: saved };
  } catch (error) {
    return { error: messageFor(error, "Não foi possível guardar a loja.") };
  }
}

export async function deleteStore(formData: FormData): Promise<ActionResult> {
  const id = Number(formData.get("id"));

  try {
    await adminFetch(`/stores/${id}`, { method: "DELETE" });
  } catch (error) {
    // The API refuses to delete a store still referenced by products or
    // employees; its message explains that, so pass it through.
    return { error: messageFor(error, "Não foi possível apagar a loja.") };
  }

  revalidateStores();
  return {};
}

/** Sets or replaces the store photo (the API keeps a single one). */
export async function uploadStoreImage(
  formData: FormData,
): Promise<ActionResult> {
  const storeId = Number(formData.get("store_id"));
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Escolha uma imagem." };
  }

  const upload = new FormData();
  upload.set("file", file);

  try {
    await adminFetch(`/stores/${storeId}/image`, {
      method: "PUT",
      body: upload,
    });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível enviar a fotografia.") };
  }

  revalidateStores();
  return {};
}

export async function deleteStoreImage(
  formData: FormData,
): Promise<ActionResult> {
  const storeId = Number(formData.get("store_id"));

  try {
    await adminFetch(`/stores/${storeId}/image`, { method: "DELETE" });
  } catch (error) {
    return {
      error: messageFor(error, "Não foi possível remover a fotografia."),
    };
  }

  revalidateStores();
  return {};
}
