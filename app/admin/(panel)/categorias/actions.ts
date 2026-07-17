"use server";

import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { ActionResult } from "@/lib/admin";

/** Pages whose content changes when categories change. */
function revalidateCategories() {
  revalidatePath("/admin/categorias");
  revalidatePath("/categorias");
  revalidatePath("/produtos");
  revalidatePath("/");
}

/**
 * Turns a failure into a message worth showing. The API already explains
 * itself in Portuguese (e.g. refusing to delete a category still in use), so
 * prefer its message over a generic one.
 */
function messageFor(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "O nome não pode estar vazio." };

  try {
    await adminFetch("/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível criar a categoria.") };
  }

  revalidateCategories();
  return {};
}

export async function renameCategory(formData: FormData): Promise<ActionResult> {
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "O nome não pode estar vazio." };

  try {
    await adminFetch(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível guardar o nome.") };
  }

  revalidateCategories();
  return {};
}

export async function deleteCategory(formData: FormData): Promise<ActionResult> {
  const id = Number(formData.get("id"));

  try {
    await adminFetch(`/categories/${id}`, { method: "DELETE" });
  } catch (error) {
    // The API refuses to delete a category still used by products; show why.
    return { error: messageFor(error, "Não foi possível apagar a categoria.") };
  }

  revalidateCategories();
  return {};
}
