"use client";

import { useState, type MouseEvent } from "react";
import type { ProductImage } from "@/lib/api/types";

/**
 * The image area of a product card. Shows the current image and, when the
 * product has more than one, reveals arrows on hover (plus dots) to page
 * through them. Fills its relatively positioned parent.
 */
export function ProductImages({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-2/5 text-primary/25"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M50 8C30 20 18 40 22 66c2 14 12 24 26 26 0-24-2-44-14-60 18 10 30 28 30 52 14-6 22-22 20-40C102 30 78 14 50 8Z" />
        </svg>
      </div>
    );
  }

  function step(event: MouseEvent<HTMLButtonElement>, delta: number) {
    // Keep the arrows from triggering an enclosing link once the card is one.
    event.preventDefault();
    event.stopPropagation();
    setIndex((current) => (current + delta + images.length) % images.length);
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[index].image_url}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {images.length > 1 && (
        <>
          <ImageArrow direction="prev" onClick={(event) => step(event, -1)} />
          <ImageArrow direction="next" onClick={(event) => step(event, 1)} />

          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {images.map((image, i) => (
              <span
                key={image.id}
                className={`h-1.5 w-1.5 rounded-full transition ${
                  i === index ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function ImageArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? "Imagem anterior" : "Imagem seguinte"}
      className={`absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-white/85 opacity-0 transition duration-200 group-hover:opacity-100 hover:text-white ${
        isPrev ? "left-2" : "right-2"
      }`}
    >
      <svg
        width="18"
        height="18"
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
