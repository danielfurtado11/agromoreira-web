"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Store } from "@/lib/api/types";
import { WEEKDAY_ORDER } from "@/lib/opening-hours";
import {
  deleteStoreImage,
  uploadStoreImage,
  type StoreActionResult,
} from "./actions";

const INPUT =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-primary";
const LABEL = "block text-sm font-medium";

/** Reads one day's hours out of the free-form opening_hours object. */
function hoursFor(store: Store | undefined, day: string): string {
  const value = store?.opening_hours?.[day];
  return typeof value === "string" ? value : "";
}

/**
 * The store form, shared by the create and edit windows.
 *
 * Opening hours are edited as one text field per weekday — matching how the
 * API stores them (a day → text object) without asking the admin to write
 * JSON. An empty field omits the day from the site.
 *
 * The photo works like a product's: the upload endpoint needs a store id, so
 * when creating we hold the chosen file in memory and send it right after the
 * store is saved — the admin fills one form, presses once, and never sees the
 * two requests. When editing, the store already exists, so uploads take effect
 * immediately.
 */
export function StoreForm({
  store,
  action,
  submitLabel,
  notice,
  onCancel,
  onSaved,
}: {
  /** Undefined when creating. */
  store?: Store;
  action: (formData: FormData) => Promise<StoreActionResult>;
  submitLabel: string;
  /** Message carried over from a previous step (e.g. a failed photo upload). */
  notice?: string;
  onCancel: () => void;
  /** `photoFailed` is true when the store saved but its photo did not upload. */
  onSaved: (store: Store, photoFailed: boolean) => void;
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

      const saved = result.store;
      if (!saved) return;

      // Creating with a photo: the store exists now, so send the file that was
      // held in memory. A failed photo is recoverable (the window reopens on
      // the saved store to retry), which beats losing the whole form.
      let photoFailed = false;
      if (pendingPhoto) {
        setUploading(true);
        const photoData = new FormData();
        photoData.set("store_id", String(saved.id));
        photoData.set("file", pendingPhoto);
        const uploadResult = await uploadStoreImage(photoData);
        setUploading(false);
        photoFailed = Boolean(uploadResult.error);
      }

      onSaved(saved, photoFailed);
    });
  }

  return (
    <form action={submit} className="space-y-5">
      {store && <input type="hidden" name="id" value={store.id} />}

      <div>
        <label htmlFor="name" className={LABEL}>
          Nome
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={100}
          defaultValue={store?.name ?? ""}
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor="address" className={LABEL}>
          Morada
        </label>
        <input
          id="address"
          name="address"
          required
          maxLength={200}
          defaultValue={store?.address ?? ""}
          className={INPUT}
        />
      </div>

      <fieldset>
        <legend className={LABEL}>Horário</legend>
        <p className="mt-1 text-xs text-ink-soft">
          Deixe um dia vazio para não o mostrar no site. Escreva
          &quot;Fechado&quot; para indicar que a loja não abre nesse dia.
        </p>
        <div className="mt-3 space-y-2">
          {WEEKDAY_ORDER.map((day) => (
            <div key={day} className="flex items-center gap-3">
              <label
                htmlFor={`hours_${day}`}
                className="w-24 text-sm capitalize text-ink-soft"
              >
                {day}
              </label>
              <input
                id={`hours_${day}`}
                name={`hours_${day}`}
                placeholder="ex.: 9h-13h, 14h-19h"
                defaultValue={hoursFor(store, day)}
                className={`${INPUT} mt-0 flex-1`}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <div className="border-t border-line pt-5">
        {store ? (
          // Saved store: uploads take effect immediately.
          <StorePhotoEditor store={store} />
        ) : (
          <PendingPhotoPicker file={pendingPhoto} onChange={setPendingPhoto} />
        )}
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

/**
 * Photo picker for a store that does not exist yet.
 *
 * The API only accepts uploads for a saved store, so while creating we hold
 * the chosen file in memory and preview it; StoreForm uploads it right after
 * the store is created.
 */
function PendingPhotoPicker({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
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
      <p className={LABEL}>Fotografia</p>
      <p className="mt-1 text-xs text-ink-soft">
        É enviada ao criar a loja.
      </p>

      <div className="mt-3 flex flex-wrap items-start gap-4">
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="h-24 w-32 rounded-lg border border-line object-cover"
          />
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-primary hover:text-primary"
          >
            {file ? "Trocar fotografia" : "Adicionar fotografia"}
          </button>
          {file && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50"
            >
              Remover
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
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

/**
 * The store's single photo, once it exists: show it, replace it, or remove it.
 *
 * Uploads take effect immediately (no separate "save" step): the actions
 * revalidate the whole tree, the fresh store flows back into the open window
 * through props, and the thumbnail updates by itself.
 */
function StorePhotoEditor({ store }: { store: Store }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function upload(file: File) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("store_id", String(store.id));
      formData.set("file", file);
      const result = await uploadStoreImage(formData);
      setError(result.error ?? null);
    });
  }

  function remove() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("store_id", String(store.id));
      const result = await deleteStoreImage(formData);
      setError(result.error ?? null);
    });
  }

  return (
    <div>
      <p className={LABEL}>Fotografia</p>

      <div className="mt-2 flex flex-wrap items-start gap-4">
        {store.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.image_url}
            alt={`Fotografia de ${store.name}`}
            className="h-24 w-32 rounded-lg border border-line object-cover"
          />
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-primary hover:text-primary disabled:opacity-60"
          >
            {pending
              ? "Aguarde..."
              : store.image_url
                ? "Substituir fotografia"
                : "Adicionar fotografia"}
          </button>
          {store.image_url && (
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-60"
            >
              Remover fotografia
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
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
