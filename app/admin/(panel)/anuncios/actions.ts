"use server";

import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { ActionResult } from "@/lib/admin";

/**
 * The announcement bar sits in the root layout, on every page, so any change
 * must revalidate the whole tree — not a fixed list of paths.
 */
function revalidateAnnouncements() {
  revalidatePath("/", "layout");
}

function messageFor(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}

type AnnouncementPayload = {
  title: string;
  message: string;
  is_active: boolean;
};

/** Reads the form once; create and update share exactly the same fields. */
function readForm(
  formData: FormData,
): AnnouncementPayload | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "O título não pode estar vazio." };

  const message = String(formData.get("message") ?? "").trim();
  if (!message) return { error: "A mensagem não pode estar vazia." };

  // Unchecked checkboxes are simply absent from FormData.
  return { title, message, is_active: formData.get("is_active") != null };
}

export async function createAnnouncement(
  formData: FormData,
): Promise<ActionResult> {
  const payload = readForm(formData);
  if ("error" in payload) return payload;

  try {
    await adminFetch("/announcements", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível criar o aviso.") };
  }

  revalidateAnnouncements();
  return {};
}

export async function updateAnnouncement(
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get("id"));
  const payload = readForm(formData);
  if ("error" in payload) return payload;

  try {
    await adminFetch(`/announcements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível guardar o aviso.") };
  }

  revalidateAnnouncements();
  return {};
}

export async function deleteAnnouncement(
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get("id"));

  try {
    await adminFetch(`/announcements/${id}`, { method: "DELETE" });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível apagar o aviso.") };
  }

  revalidateAnnouncements();
  return {};
}
