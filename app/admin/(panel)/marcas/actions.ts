"use server";

import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Brand } from "@/lib/api/types";
import type { ActionResult } from "@/lib/admin";

/**
 * Create and update also report the saved brand, so the window can move
 * straight on to the logo upload without waiting for the list to refresh.
 */
export type BrandActionResult = ActionResult & { brand?: Brand };

/** Brands are shown in the homepage marquee, so a change must revalidate it. */
function revalidateBrands() {
  revalidatePath("/", "layout");
}

function messageFor(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}

/**
 * Reads the fields shared by create and update. The order is optional (empty =
 * let the API place the brand last); is_active comes from a checkbox, so an
 * absent value means "hidden".
 */
function readForm(
  formData: FormData,
):
  | { name: string; display_order: number | null; is_active: boolean }
  | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "O nome não pode estar vazio." };

  const orderRaw = String(formData.get("display_order") ?? "").trim();
  const display_order = orderRaw === "" ? null : Number(orderRaw);
  if (
    display_order !== null &&
    (!Number.isInteger(display_order) || display_order < 1)
  ) {
    return { error: "A ordem tem de ser um número inteiro igual ou maior que 1." };
  }

  return { name, display_order, is_active: formData.get("is_active") != null };
}

export async function createBrand(
  formData: FormData,
): Promise<BrandActionResult> {
  const payload = readForm(formData);
  if ("error" in payload) return payload;

  try {
    const created = await adminFetch<Brand>("/brands", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    revalidateBrands();
    return { brand: created };
  } catch (error) {
    return { error: messageFor(error, "Não foi possível criar a marca.") };
  }
}

export async function updateBrand(
  formData: FormData,
): Promise<BrandActionResult> {
  const id = Number(formData.get("id"));
  const payload = readForm(formData);
  if ("error" in payload) return payload;

  try {
    const saved = await adminFetch<Brand>(`/brands/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    revalidateBrands();
    return { brand: saved };
  } catch (error) {
    return { error: messageFor(error, "Não foi possível guardar a marca.") };
  }
}

export async function deleteBrand(formData: FormData): Promise<ActionResult> {
  const id = Number(formData.get("id"));

  try {
    await adminFetch(`/brands/${id}`, { method: "DELETE" });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível apagar a marca.") };
  }

  revalidateBrands();
  return {};
}

/** Sets or replaces the brand logo (the API keeps a single one). */
export async function uploadBrandImage(
  formData: FormData,
): Promise<ActionResult> {
  const brandId = Number(formData.get("brand_id"));
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Escolha uma imagem." };
  }

  const upload = new FormData();
  upload.set("file", file);

  try {
    await adminFetch(`/brands/${brandId}/image`, {
      method: "PUT",
      body: upload,
    });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível enviar o logótipo.") };
  }

  revalidateBrands();
  return {};
}

export async function deleteBrandImage(
  formData: FormData,
): Promise<ActionResult> {
  const brandId = Number(formData.get("brand_id"));

  try {
    await adminFetch(`/brands/${brandId}/image`, { method: "DELETE" });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível remover o logótipo.") };
  }

  revalidateBrands();
  return {};
}
