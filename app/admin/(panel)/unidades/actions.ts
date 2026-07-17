"use server";

import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { ActionResult } from "@/lib/admin";

/** Pages whose content changes when units change (they show "/ kg" prices). */
function revalidateUnits() {
  revalidatePath("/admin/unidades");
  revalidatePath("/produtos");
  revalidatePath("/");
}

/**
 * Turns a failure into a message worth showing. The API already explains
 * itself in Portuguese (e.g. refusing to delete a unit still in use), so
 * prefer its message over a generic one.
 */
function messageFor(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}

export async function createUnit(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "O nome não pode estar vazio." };

  try {
    await adminFetch("/units", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível criar a unidade.") };
  }

  revalidateUnits();
  return {};
}

export async function renameUnit(formData: FormData): Promise<ActionResult> {
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "O nome não pode estar vazio." };

  try {
    await adminFetch(`/units/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível guardar o nome.") };
  }

  revalidateUnits();
  return {};
}

export async function deleteUnit(formData: FormData): Promise<ActionResult> {
  const id = Number(formData.get("id"));

  try {
    await adminFetch(`/units/${id}`, { method: "DELETE" });
  } catch (error) {
    // The API refuses to delete a unit still used by products; show why.
    return { error: messageFor(error, "Não foi possível apagar a unidade.") };
  }

  revalidateUnits();
  return {};
}
