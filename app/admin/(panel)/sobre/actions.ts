"use server";

import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { ActionResult } from "@/lib/admin";

/**
 * The "Sobre" content feeds the footer (email + socials) on every page, plus
 * the /sobre and /contactos pages — so a change must revalidate the whole tree.
 */
function revalidateAbout() {
  revalidatePath("/", "layout");
}

/** An empty text field means "no value", which the API expects as null. */
function optionalText(formData: FormData, field: string): string | null {
  const value = String(formData.get(field) ?? "").trim();
  return value === "" ? null : value;
}

export async function saveAboutUs(formData: FormData): Promise<ActionResult> {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "O texto não pode estar vazio." };

  // The record is a singleton and the endpoint is an upsert (PUT), so the form
  // always submits every field; unset optional fields go as null.
  const payload = {
    text,
    email: optionalText(formData, "email"),
    video_url: optionalText(formData, "video_url"),
    facebook_url: optionalText(formData, "facebook_url"),
    instagram_url: optionalText(formData, "instagram_url"),
  };

  try {
    await adminFetch("/about-us", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // The API validates video_url; a bad link comes back as a 422 whose detail
    // the client cannot flatten, so fall back to a clear message of our own.
    if (error instanceof ApiError) {
      if (error.status === 422) {
        return {
          error:
            "O link do vídeo não é válido. Use um endereço do YouTube (ex.: https://www.youtube.com/watch?v=...).",
        };
      }
      return { error: error.message };
    }
    return { error: "Não foi possível guardar o conteúdo." };
  }

  revalidateAbout();
  return {};
}
