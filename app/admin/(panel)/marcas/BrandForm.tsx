"use client";

import { useState, useTransition } from "react";
import type { Brand } from "@/lib/api/types";
import {
  PendingPhotoField,
  SavedPhotoField,
} from "@/components/admin/SinglePhotoField";
import {
  deleteBrandImage,
  uploadBrandImage,
  type BrandActionResult,
} from "./actions";

const INPUT =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-primary";
const LABEL = "block text-sm font-medium";

/**
 * The brand form, shared by the create and edit windows.
 *
 * The logo works like a store photo: the upload endpoint needs a brand id, so
 * when creating we hold the chosen file in memory and send it right after the
 * brand is saved — one form, one press, the two requests hidden. When editing,
 * the brand already exists, so uploads take effect immediately.
 */
export function BrandForm({
  brand,
  action,
  submitLabel,
  notice,
  onCancel,
  onSaved,
}: {
  /** Undefined when creating. */
  brand?: Brand;
  action: (formData: FormData) => Promise<BrandActionResult>;
  submitLabel: string;
  /** Message carried over from a previous step (e.g. a failed logo upload). */
  notice?: string;
  onCancel: () => void;
  /** `logoFailed` is true when the brand saved but its logo did not upload. */
  onSaved: (brand: Brand, logoFailed: boolean) => void;
}) {
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
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

      const saved = result.brand;
      if (!saved) return;

      // Creating with a logo: the brand exists now, so send the file held in
      // memory. A failed logo is recoverable (the window reopens on the saved
      // brand to retry), which beats losing the whole form.
      let logoFailed = false;
      if (pendingLogo) {
        setUploading(true);
        const logoData = new FormData();
        logoData.set("brand_id", String(saved.id));
        logoData.set("file", pendingLogo);
        const uploadResult = await uploadBrandImage(logoData);
        setUploading(false);
        logoFailed = Boolean(uploadResult.error);
      }

      onSaved(saved, logoFailed);
    });
  }

  return (
    <form action={submit} className="space-y-5">
      {brand && <input type="hidden" name="id" value={brand.id} />}

      <div>
        <label htmlFor="name" className={LABEL}>
          Nome
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={100}
          defaultValue={brand?.name ?? ""}
          placeholder="Ex.: Bayer"
          className={INPUT}
        />
        <p className="mt-1 text-xs text-ink-soft">
          Usado como texto alternativo do logótipo (acessibilidade), mesmo que
          não apareça escrito.
        </p>
      </div>

      <div>
        <label htmlFor="display_order" className={LABEL}>
          Ordem (opcional)
        </label>
        <input
          id="display_order"
          name="display_order"
          type="number"
          min={1}
          step={1}
          defaultValue={brand?.display_order ?? ""}
          placeholder="Deixe vazio para ficar no fim"
          className={INPUT}
        />
        <p className="mt-1 text-xs text-ink-soft">
          Número menor aparece primeiro no carrossel. As marcas sem ordem ficam
          no fim, por ordem alfabética.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={brand?.is_active ?? true}
          className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
        />
        Visível no site
      </label>

      <div className="border-t border-line pt-5">
        {brand ? (
          <SavedPhotoField
            entityId={brand.id}
            entityName={brand.name}
            imageUrl={brand.image_url}
            idField="brand_id"
            label="Logótipo"
            fit="contain"
            uploadAction={uploadBrandImage}
            deleteAction={deleteBrandImage}
          />
        ) : (
          <PendingPhotoField
            file={pendingLogo}
            onChange={setPendingLogo}
            label="Logótipo"
            fit="contain"
            hint="É enviado ao criar a marca."
          />
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
            ? "A enviar logótipo..."
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
