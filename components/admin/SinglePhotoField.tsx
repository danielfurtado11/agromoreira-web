"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { ActionResult } from "@/lib/admin";

/**
 * The one-photo field shared by the store and employee forms: both entities
 * have a single optional photo with identical upload/replace/remove behaviour,
 * so one copy stops the two drifting apart (as NameListManager does for
 * categories and units).
 *
 * It comes in two shapes because the API only accepts a photo for an entity
 * that already exists:
 *  - PendingPhotoField, while creating: holds the chosen file in memory and
 *    previews it; the form uploads it right after the entity is saved.
 *  - SavedPhotoField, while editing: uploads take effect immediately, through
 *    the actions passed in by each entity.
 */

const LABEL = "block text-sm font-medium";

const QUIET_BUTTON =
  "rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-primary hover:text-primary disabled:opacity-60";
const DANGER_BUTTON =
  "rounded-full border border-line px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-60";
const THUMB_BASE = "h-24 w-32 rounded-lg border border-line";

/** Thumbnail classes: photos crop to fill, logos read better contained. */
function thumbClass(fit: "cover" | "contain"): string {
  return `${THUMB_BASE} ${fit === "contain" ? "object-contain" : "object-cover"}`;
}

/** Accepted upload types, kept in step with the API's allowed image types. */
const ACCEPT = "image/jpeg,image/png,image/webp";

type ImageAction = (formData: FormData) => Promise<ActionResult>;

export function PendingPhotoField({
  file,
  onChange,
  hint,
  label = "Fotografia",
  fit = "cover",
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  /** One line under the label, e.g. "É enviada ao criar a loja." */
  hint: string;
  /** Field heading; defaults to "Fotografia" (brands pass "Logótipo"). */
  label?: string;
  /** How the preview is fitted; logos use "contain" so nothing is cropped. */
  fit?: "cover" | "contain";
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive the preview URL from the file rather than mirroring it into state.
  // The object URL is a manual resource, so the effect releases it when the
  // selection changes or this unmounts — otherwise the blob leaks.
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <div>
      <p className={LABEL}>{label}</p>
      <p className="mt-1 text-xs text-ink-soft">{hint}</p>

      <div className="mt-3 flex flex-wrap items-start gap-4">
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className={thumbClass(fit)} />
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={QUIET_BUTTON}
          >
            {file ? "Trocar fotografia" : "Adicionar fotografia"}
          </button>
          {file && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className={DANGER_BUTTON}
            >
              Remover
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => {
          const chosen = event.target.files?.[0];
          if (chosen) onChange(chosen);
          // Reset so choosing the same file again still fires onChange.
          event.target.value = "";
        }}
      />
    </div>
  );
}

export function SavedPhotoField({
  entityId,
  entityName,
  imageUrl,
  idField,
  uploadAction,
  deleteAction,
  label = "Fotografia",
  fit = "cover",
}: {
  entityId: number;
  entityName: string;
  imageUrl: string | null;
  /** Form field the actions read the id from, e.g. "store_id". */
  idField: string;
  uploadAction: ImageAction;
  deleteAction: ImageAction;
  /** Field heading; defaults to "Fotografia" (brands pass "Logótipo"). */
  label?: string;
  /** How the image is fitted; logos use "contain" so nothing is cropped. */
  fit?: "cover" | "contain";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function upload(file: File) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set(idField, String(entityId));
      formData.set("file", file);
      const result = await uploadAction(formData);
      setError(result.error ?? null);
    });
  }

  function remove() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set(idField, String(entityId));
      const result = await deleteAction(formData);
      setError(result.error ?? null);
    });
  }

  return (
    <div>
      <p className={LABEL}>{label}</p>

      <div className="mt-2 flex flex-wrap items-start gap-4">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`${label} de ${entityName}`}
            className={thumbClass(fit)}
          />
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending}
            className={QUIET_BUTTON}
          >
            {pending
              ? "Aguarde..."
              : imageUrl
                ? "Substituir fotografia"
                : "Adicionar fotografia"}
          </button>
          {imageUrl && (
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className={DANGER_BUTTON}
            >
              Remover fotografia
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
          // Reset so choosing the same file again still fires onChange.
          event.target.value = "";
        }}
      />

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
