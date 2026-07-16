"use client";

import { useState } from "react";
import type { ProductImage } from "@/lib/api/types";

/**
 * Product detail gallery: one large image with small arrows (revealed on
 * hover) to page through, plus a strip of thumbnails below. The active image
 * is shown by the highlighted thumbnail — so there are no separate dots.
 * Falls back to a leaf placeholder when the product has no images.
 */
export function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-mist">
        <LeafIcon />
      </div>
    );
  }

  const current = images[index] ?? images[0];
  const hasMany = images.length > 1;

  function step(delta: number) {
    setIndex((i) => (i + delta + images.length) % images.length);
  }

  return (
    <div>
      <div className="group relative aspect-square overflow-hidden rounded-2xl bg-mist">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.image_url}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {hasMany && (
          <>
            <GalleryArrow direction="prev" onClick={() => step(-1)} />
            <GalleryArrow direction="next" onClick={() => step(1)} />
          </>
        )}
      </div>

      {hasMany && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver imagem ${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-square overflow-hidden rounded-lg bg-mist ring-2 transition ${
                i === index
                  ? "ring-primary"
                  : "ring-transparent hover:ring-line"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.image_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? "Imagem anterior" : "Imagem seguinte"}
      className={`absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-white opacity-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] transition duration-200 group-hover:opacity-100 ${
        isPrev ? "left-2" : "right-2"
      }`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={isPrev ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}

function LeafIcon() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-1/4 text-primary/25"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M50 8C30 20 18 40 22 66c2 14 12 24 26 26 0-24-2-44-14-60 18 10 30 28 30 52 14-6 22-22 20-40C102 30 78 14 50 8Z" />
    </svg>
  );
}
