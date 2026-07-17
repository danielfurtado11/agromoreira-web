"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminFetch } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Product, ProductDetail } from "@/lib/api/types";
import type { ActionResult } from "@/lib/admin";

/** Create also reports the new id, so the modal can move on to its images. */
export type ProductActionResult = ActionResult & { productId?: number };

/** Pages whose content changes when a product changes. */
function revalidateProducts(id?: number) {
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  revalidatePath("/");
  if (id) revalidatePath(`/produtos/${id}`);
}

function messageFor(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}

/** An empty text field means "no value", which the API expects as null. */
function optionalText(formData: FormData, field: string): string | null {
  const value = String(formData.get(field) ?? "").trim();
  return value === "" ? null : value;
}

/** Unchecked checkboxes are simply absent from FormData. */
function checkbox(formData: FormData, field: string): boolean {
  return formData.get(field) != null;
}

type ProductPayload = {
  name: string;
  description: string | null;
  price: string;
  discount_price: string | null;
  category_id: number;
  unit_id: number;
  embed_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  store_ids: number[];
};

/** Reads the form once; create and update share exactly the same fields. */
function readForm(formData: FormData): ProductPayload | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "O nome não pode estar vazio." };

  const price = String(formData.get("price") ?? "").trim();
  if (!price) return { error: "O preço é obrigatório." };

  const categoryId = Number(formData.get("category_id"));
  const unitId = Number(formData.get("unit_id"));
  if (!categoryId) return { error: "Escolha uma categoria." };
  if (!unitId) return { error: "Escolha uma unidade." };

  // When "em promoção" is off the field is not rendered, so it arrives as
  // null and the discount is cleared.
  const discountPrice = optionalText(formData, "discount_price");
  if (discountPrice !== null && Number(discountPrice) >= Number(price)) {
    return { error: "O preço promocional tem de ser inferior ao preço normal." };
  }

  return {
    name,
    description: optionalText(formData, "description"),
    price,
    discount_price: discountPrice,
    category_id: categoryId,
    unit_id: unitId,
    embed_url: optionalText(formData, "embed_url"),
    is_active: checkbox(formData, "is_active"),
    is_featured: checkbox(formData, "is_featured"),
    store_ids: formData.getAll("store_ids").map(Number),
  };
}

/** Loads one product with its stores and images, to fill the edit window. */
export async function loadProduct(id: number): Promise<ProductDetail> {
  return adminFetch<ProductDetail>(`/products/${id}`);
}

export async function createProduct(
  formData: FormData,
): Promise<ProductActionResult> {
  const payload = readForm(formData);
  if ("error" in payload) return payload;

  try {
    const created = await adminFetch<Product>("/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    revalidateProducts(created.id);
    return { productId: created.id };
  } catch (error) {
    return { error: messageFor(error, "Não foi possível criar o produto.") };
  }
}

export async function updateProduct(
  formData: FormData,
): Promise<ProductActionResult> {
  const id = Number(formData.get("id"));
  const payload = readForm(formData);
  if ("error" in payload) return payload;

  try {
    await adminFetch(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível guardar o produto.") };
  }

  revalidateProducts(id);
  return { productId: id };
}

/**
 * Flips just the "featured" flag. The API's PATCH ignores fields that are not
 * sent, so nothing else about the product is touched.
 */
export async function setProductFeatured(
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get("id"));
  const featured = formData.get("featured") === "true";

  try {
    await adminFetch(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_featured: featured }),
    });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível alterar o destaque.") };
  }

  revalidateProducts(id);
  return {};
}

export async function deleteProduct(formData: FormData): Promise<ActionResult> {
  const id = Number(formData.get("id"));
  const redirectTo = formData.get("redirect_to");

  try {
    await adminFetch(`/products/${id}`, { method: "DELETE" });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível apagar o produto.") };
  }

  revalidateProducts(id);

  // Deleting from the product's own detail page: that page is gone now, so
  // the caller asks to land somewhere else. Restricted to internal paths, and
  // done here (not on the client) so the navigation and the revalidation
  // travel in the same response — no flash of a 404 in between.
  if (typeof redirectTo === "string" && redirectTo.startsWith("/")) {
    redirect(redirectTo);
  }

  return {};
}

/**
 * Uploads one photo. The API takes multipart/form-data, so the file is passed
 * straight through rather than serialised as JSON.
 */
export async function uploadProductImage(
  formData: FormData,
): Promise<ActionResult> {
  const productId = Number(formData.get("product_id"));
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Escolha uma imagem." };
  }

  const upload = new FormData();
  upload.set("file", file);

  try {
    await adminFetch(`/products/${productId}/images`, {
      method: "POST",
      body: upload,
    });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível enviar a imagem.") };
  }

  revalidateProducts(productId);
  return {};
}

export async function deleteProductImage(
  formData: FormData,
): Promise<ActionResult> {
  const productId = Number(formData.get("product_id"));
  const imageId = Number(formData.get("image_id"));

  try {
    await adminFetch(`/products/${productId}/images/${imageId}`, {
      method: "DELETE",
    });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível apagar a imagem.") };
  }

  revalidateProducts(productId);
  return {};
}

/** The cover is the photo shown first in the catalogue. */
export async function setProductCover(
  formData: FormData,
): Promise<ActionResult> {
  const productId = Number(formData.get("product_id"));
  const imageId = Number(formData.get("image_id"));

  try {
    await adminFetch(`/products/${productId}/images/${imageId}/cover`, {
      method: "PATCH",
    });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível definir a capa.") };
  }

  revalidateProducts(productId);
  return {};
}
