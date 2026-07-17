"use server";

import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Post } from "@/lib/api/types";
import type { ActionResult } from "@/lib/admin";

/**
 * Create and update also report the saved post, so the window can move
 * straight on to the photo without waiting for the list to refresh.
 */
export type PostActionResult = ActionResult & { post?: Post };

/** Pages whose content changes when a post changes. */
function revalidatePosts(id?: number) {
  revalidatePath("/admin/novidades");
  revalidatePath("/novidades");
  revalidatePath("/"); // the homepage carousel shows the latest posts
  if (id) revalidatePath(`/novidades/${id}`);
}

function messageFor(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    // The API validates embed_url; a bad link comes back as a 422 whose detail
    // the client cannot flatten, so give a clear message of our own.
    if (error.status === 422) {
      return "O link não é válido. Use um endereço do YouTube, Facebook ou Instagram.";
    }
    return error.message;
  }
  return fallback;
}

/** An empty text field means "no value", which the API expects as null. */
function optionalText(formData: FormData, field: string): string | null {
  const value = String(formData.get(field) ?? "").trim();
  return value === "" ? null : value;
}

type PostPayload = {
  title: string;
  text: string | null;
  embed_url: string | null;
  is_active: boolean;
};

/** Reads the form once; create and update share exactly the same fields. */
function readForm(formData: FormData): PostPayload | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "O título não pode estar vazio." };

  return {
    title,
    text: optionalText(formData, "text"),
    embed_url: optionalText(formData, "embed_url"),
    // Unchecked checkboxes are simply absent from FormData.
    is_active: formData.get("is_active") != null,
  };
}

export async function createPost(
  formData: FormData,
): Promise<PostActionResult> {
  const payload = readForm(formData);
  if ("error" in payload) return payload;

  try {
    const created = await adminFetch<Post>("/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    revalidatePosts(created.id);
    return { post: created };
  } catch (error) {
    return { error: messageFor(error, "Não foi possível criar a publicação.") };
  }
}

export async function updatePost(
  formData: FormData,
): Promise<PostActionResult> {
  const id = Number(formData.get("id"));
  const payload = readForm(formData);
  if ("error" in payload) return payload;

  try {
    const saved = await adminFetch<Post>(`/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    revalidatePosts(id);
    return { post: saved };
  } catch (error) {
    return {
      error: messageFor(error, "Não foi possível guardar a publicação."),
    };
  }
}

export async function deletePost(formData: FormData): Promise<ActionResult> {
  const id = Number(formData.get("id"));

  try {
    await adminFetch(`/posts/${id}`, { method: "DELETE" });
  } catch (error) {
    return {
      error: messageFor(error, "Não foi possível apagar a publicação."),
    };
  }

  revalidatePosts(id);
  return {};
}

/** Sets or replaces the post photo (the API keeps a single one). */
export async function uploadPostImage(
  formData: FormData,
): Promise<ActionResult> {
  const postId = Number(formData.get("post_id"));
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Escolha uma imagem." };
  }

  const upload = new FormData();
  upload.set("file", file);

  try {
    await adminFetch(`/posts/${postId}/image`, {
      method: "PUT",
      body: upload,
    });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível enviar a fotografia.") };
  }

  revalidatePosts(postId);
  return {};
}

export async function deletePostImage(
  formData: FormData,
): Promise<ActionResult> {
  const postId = Number(formData.get("post_id"));

  try {
    await adminFetch(`/posts/${postId}/image`, { method: "DELETE" });
  } catch (error) {
    return {
      error: messageFor(error, "Não foi possível remover a fotografia."),
    };
  }

  revalidatePosts(postId);
  return {};
}
