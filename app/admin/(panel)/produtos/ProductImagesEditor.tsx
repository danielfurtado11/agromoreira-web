"use client";

import { useRef, useState, useTransition } from "react";
import type { ProductImage } from "@/lib/api/types";
import {
  deleteProductImage,
  setProductCover,
  uploadProductImage,
} from "./actions";

/**
 * The product's photos: the ones it already has, plus a dashed "+" tile to add
 * another. Uploads happen immediately — the API only accepts images for a
 * product that already exists, so this is only rendered once it does.
 *
 * `onChanged` asks the parent to reload the product, which is what refreshes
 * this list after an upload or a delete.
 */
export function ProductImagesEditor({
  productId,
  images,
  onChanged,
}: {
  productId: number;
  images: ProductImage[];
  onChanged: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Cover first, then by position — the same order the site shows them in.
  const ordered = [...images].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.position - b.position,
  );

  function upload(file: File) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("product_id", String(productId));
      formData.set("file", file);
      const result = await uploadProductImage(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      onChanged();
    });
  }

  function remove(imageId: number) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("product_id", String(productId));
      formData.set("image_id", String(imageId));
      const result = await deleteProductImage(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      onChanged();
    });
  }

  function makeCover(imageId: number) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("product_id", String(productId));
      formData.set("image_id", String(imageId));
      const result = await setProductCover(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      onChanged();
    });
  }

  return (
    <div>
      <p className="text-sm font-medium">Fotografias</p>
      <p className="mt-1 text-xs text-ink-soft">
        A capa é a que aparece primeiro no catálogo.
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        {ordered.map((image) => (
          <div
            key={image.id}
            className="group relative h-28 w-28 overflow-hidden rounded-xl border border-line bg-mist"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.image_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />

            {image.is_cover ? (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Capa
              </span>
            ) : (
              <button
                type="button"
                onClick={() => makeCover(image.id)}
                disabled={pending}
                className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-soft opacity-0 transition hover:text-primary group-hover:opacity-100 disabled:opacity-40"
              >
                Capa
              </button>
            )}

            <button
              type="button"
              onClick={() => remove(image.id)}
              disabled={pending}
              aria-label="Apagar fotografia"
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-700 opacity-0 shadow-sm transition hover:bg-white group-hover:opacity-100 disabled:opacity-40"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add tile — same size as a photo, dashed so it reads as a control. */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={pending}
          className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-primary/40 bg-white text-primary transition hover:border-primary disabled:opacity-60"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="text-xs font-semibold">
            {pending ? "A enviar..." : "Adicionar"}
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload(file);
            // Reset so picking the same file again still fires onChange.
            event.target.value = "";
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
