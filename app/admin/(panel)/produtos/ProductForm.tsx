"use client";

import { useState, useTransition } from "react";
import type { Category, ProductDetail, Store, Unit } from "@/lib/api/types";
import { PendingImagesPicker } from "./PendingImagesPicker";
import { ProductImagesEditor } from "./ProductImagesEditor";
import { uploadProductImage, type ProductActionResult } from "./actions";

/**
 * Sends the photos chosen while creating, now that the product has an id.
 * Returns how many failed: a product with no photo is recoverable (add them in
 * the edit window), which beats losing the whole form to one bad upload.
 */
async function uploadAll(productId: number, files: File[]): Promise<number> {
  let failed = 0;
  for (const file of files) {
    const formData = new FormData();
    formData.set("product_id", String(productId));
    formData.set("file", file);
    const result = await uploadProductImage(formData);
    if (result.error) failed += 1;
  }
  return failed;
}

const INPUT =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-primary";
const LABEL = "block text-sm font-medium";
const CHECKBOX = "h-4 w-4 accent-[var(--color-primary)]";

/**
 * The product form, shared by the create and edit windows — the fields are
 * identical, so one copy stops the two drifting apart.
 *
 * Creating a product with photos takes several API calls (create, then one
 * upload per file, because images are a sub-resource). That sequence is
 * orchestrated here, behind a single button: the admin fills one form, presses
 * once, and never sees the seams.
 */
export function ProductForm({
  categories,
  units,
  stores,
  product,
  initialCategoryId,
  action,
  submitLabel,
  notice,
  onCancel,
  onSaved,
  onImagesChanged,
}: {
  categories: Category[];
  units: Unit[];
  stores: Store[];
  /** Undefined when creating. */
  product?: ProductDetail;
  /** Pre-selected category when creating (from the category being browsed). */
  initialCategoryId?: number;
  action: (formData: FormData) => Promise<ProductActionResult>;
  submitLabel: string;
  /** Message carried over from a previous step (e.g. a failed upload). */
  notice?: string;
  onCancel: () => void;
  onSaved: (productId: number, failedUploads: number) => void;
  onImagesChanged: () => void;
}) {
  // Promotion is a client-only toggle: with it off the price field is not
  // rendered, so it reaches the server as null and the discount is cleared.
  const [onSale, setOnSale] = useState(product?.discount_price != null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const selectedStores = new Set(product?.stores.map((store) => store.id));
  const busy = pending || uploading;

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);

      const productId = result.productId;
      if (!productId) return;

      let failed = 0;
      if (pendingFiles.length > 0) {
        setUploading(true);
        failed = await uploadAll(productId, pendingFiles);
        setUploading(false);
      }
      onSaved(productId, failed);
    });
  }

  return (
    <form action={submit} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div>
        <label htmlFor="name" className={LABEL}>
          Nome
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={product?.name ?? ""}
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor="description" className={LABEL}>
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          className={INPUT}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="price" className={LABEL}>
            Preço (€)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price ?? ""}
            className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="unit_id" className={LABEL}>
            Unidade
          </label>
          <select
            id="unit_id"
            name="unit_id"
            required
            defaultValue={product?.unit.id ?? ""}
            className={INPUT}
          >
            <option value="" disabled>
              Escolher...
            </option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category_id" className={LABEL}>
            Categoria
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue={product?.category.id ?? initialCategoryId ?? ""}
            className={INPUT}
          >
            <option value="" disabled>
              Escolher...
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-line p-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={onSale}
            onChange={(event) => setOnSale(event.target.checked)}
            className={CHECKBOX}
          />
          Colocar em promoção
        </label>

        {onSale && (
          <div className="mt-3 max-w-52">
            <label htmlFor="discount_price" className={LABEL}>
              Preço promocional (€)
            </label>
            <input
              id="discount_price"
              name="discount_price"
              type="number"
              step="0.01"
              min="0"
              required
              autoFocus
              defaultValue={product?.discount_price ?? ""}
              className={INPUT}
            />
            <p className="mt-1 text-xs text-ink-soft">
              Tem de ser inferior ao preço normal.
            </p>
          </div>
        )}
      </div>

      <fieldset>
        <legend className={LABEL}>Disponível em</legend>
        <div className="mt-2 space-y-2">
          {stores.map((store) => (
            <label key={store.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="store_ids"
                value={store.id}
                defaultChecked={selectedStores.has(store.id)}
                className={CHECKBOX}
              />
              {store.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="embed_url" className={LABEL}>
          Vídeo (opcional)
        </label>
        <input
          id="embed_url"
          name="embed_url"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          defaultValue={product?.embed_url ?? ""}
          className={INPUT}
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={product?.is_featured ?? false}
            className={CHECKBOX}
          />
          Destaque
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_active"
            // New products are available unless the admin says otherwise.
            defaultChecked={product?.is_active ?? true}
            className={CHECKBOX}
          />
          Disponível
        </label>
      </div>

      <div className="border-t border-line pt-5">
        {product ? (
          // Saved product: uploads take effect immediately.
          <ProductImagesEditor
            productId={product.id}
            images={product.images}
            onChanged={onImagesChanged}
          />
        ) : (
          <PendingImagesPicker
            files={pendingFiles}
            onChange={setPendingFiles}
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
            ? "A enviar fotografias..."
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
