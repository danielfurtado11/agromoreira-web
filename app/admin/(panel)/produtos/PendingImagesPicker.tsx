"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Photo picker for a product that does not exist yet.
 *
 * The API only accepts uploads for a saved product (images are a sub-resource
 * with their own lifecycle), so while creating we just hold the chosen files
 * in memory and preview them. ProductForm uploads them right after the
 * product is created — the admin presses one button and never learns that it
 * took several requests.
 */
export function PendingImagesPicker({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // Object URLs are a manual resource: create one per file and release them
  // when the selection changes or this unmounts, or the blobs leak.
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);

  return (
    <div>
      <p className="text-sm font-medium">Fotografias</p>
      <p className="mt-1 text-xs text-ink-soft">
        A primeira será a capa. São enviadas ao criar o produto.
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="group relative h-28 w-28 overflow-hidden rounded-xl border border-line bg-mist"
          >
            {previews[index] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previews[index]}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            {index === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Capa
              </span>
            )}

            <button
              type="button"
              onClick={() => onChange(files.filter((_, i) => i !== index))}
              aria-label={`Remover ${file.name}`}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-700 opacity-0 shadow-sm transition hover:bg-white group-hover:opacity-100"
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

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-primary/40 bg-white text-primary transition hover:border-primary"
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
          <span className="text-xs font-semibold">Adicionar</span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            const chosen = Array.from(event.target.files ?? []);
            if (chosen.length) onChange([...files, ...chosen]);
            // Reset so picking the same file again still fires onChange.
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
