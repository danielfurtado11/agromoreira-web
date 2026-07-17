"use client";

import { useState, useTransition } from "react";
import type { Post } from "@/lib/api/types";
import {
  PendingPhotoField,
  SavedPhotoField,
} from "@/components/admin/SinglePhotoField";
import {
  deletePostImage,
  uploadPostImage,
  type PostActionResult,
} from "./actions";

const INPUT =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-primary";
const LABEL = "block text-sm font-medium";
const CHECKBOX = "h-4 w-4 accent-[var(--color-primary)]";

/**
 * The post form, shared by the create and edit windows.
 *
 * A post can be text, a photo, a video link, or any combination — only the
 * title is required — so every media field is optional and the page decides
 * how to render based on which are filled. The photo works the product way:
 * held in memory while creating and uploaded right after the post is saved
 * (the upload endpoint needs an id); immediate while editing.
 */
export function PostForm({
  post,
  action,
  submitLabel,
  notice,
  onCancel,
  onSaved,
}: {
  /** Undefined when creating. */
  post?: Post;
  action: (formData: FormData) => Promise<PostActionResult>;
  submitLabel: string;
  /** Message carried over from a previous step (e.g. a failed photo upload). */
  notice?: string;
  onCancel: () => void;
  /** `photoFailed` is true when the post saved but its photo did not upload. */
  onSaved: (post: Post, photoFailed: boolean) => void;
}) {
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const busy = pending || uploading;

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);

      const saved = result.post;
      if (!saved) return;

      // Creating with a photo: the post exists now, so send the file held in
      // memory. A failed photo is recoverable (the window reopens to retry),
      // which beats losing the whole form.
      let photoFailed = false;
      if (pendingPhoto) {
        setUploading(true);
        const photoData = new FormData();
        photoData.set("post_id", String(saved.id));
        photoData.set("file", pendingPhoto);
        const uploadResult = await uploadPostImage(photoData);
        setUploading(false);
        photoFailed = Boolean(uploadResult.error);
      }

      onSaved(saved, photoFailed);
    });
  }

  return (
    <form action={submit} className="space-y-5">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div>
        <label htmlFor="title" className={LABEL}>
          Título
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={post?.title ?? ""}
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor="text" className={LABEL}>
          Texto (opcional)
        </label>
        <textarea
          id="text"
          name="text"
          rows={5}
          defaultValue={post?.text ?? ""}
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor="embed_url" className={LABEL}>
          Link de vídeo ou rede social (opcional)
        </label>
        <input
          id="embed_url"
          name="embed_url"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          defaultValue={post?.embed_url ?? ""}
          className={INPUT}
        />
        <p className="mt-1 text-xs text-ink-soft">
          Aceita YouTube, Facebook ou Instagram. O vídeo aparece dentro da
          publicação; o Instagram fica como ligação.
        </p>
      </div>

      <div className="border-t border-line pt-5">
        {post ? (
          <SavedPhotoField
            entityId={post.id}
            entityName={post.title}
            imageUrl={post.image_url}
            idField="post_id"
            uploadAction={uploadPostImage}
            deleteAction={deletePostImage}
          />
        ) : (
          <PendingPhotoField
            file={pendingPhoto}
            onChange={setPendingPhoto}
            hint="É enviada ao criar a publicação. Pode juntar-se a um texto e/ou a um vídeo."
          />
        )}
      </div>

      <div className="border-t border-line pt-5">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_active"
            // New posts are visible unless the admin says otherwise.
            defaultChecked={post?.is_active ?? true}
            className={CHECKBOX}
          />
          Visível no site
        </label>
        <p className="mt-1 text-xs text-ink-soft">
          Desligue para guardar um rascunho sem o mostrar no site.
        </p>
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-lg border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-accent-ink"
        >
          {notice}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-t border-line pt-5">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-deep disabled:opacity-60"
        >
          {uploading
            ? "A enviar fotografia..."
            : pending
              ? "A guardar..."
              : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-ink-soft hover:text-ink disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
