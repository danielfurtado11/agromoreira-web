"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { deleteProduct } from "@/app/admin/(panel)/produtos/actions";

/**
 * Edit/remove shortcuts shown over a product card to a signed-in admin.
 *
 * Rendered as a *sibling* of the card's link, never inside it: nesting a
 * button or a second link inside an <a> is invalid HTML, and a click on the
 * menu would also follow the card link.
 *
 * "Editar" deep-links to /admin/produtos?editar=<id>, which the panel reads to
 * open that product's edit window straight away. "Remover" deletes in place
 * after confirmation — the delete action revalidates the public pages, so the
 * card simply disappears.
 *
 * On the product's own detail page the card *is* the page, so pass
 * `afterDeleteHref` and the delete action redirects there instead of leaving
 * the admin on a page that no longer exists.
 */
export function ProductCardMenu({
  productId,
  productName,
  afterDeleteHref,
  overlay = false,
}: {
  productId: number;
  productName: string;
  /** Internal path to land on after a successful delete. */
  afterDeleteHref?: string;
  /**
   * True when the button sits on top of a photo (the catalogue cards): the
   * icon turns white with a dark drop shadow, which stays readable on both
   * light and dark images. Off, it is grey for plain white backgrounds.
   */
  overlay?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  // Close the menu on any click outside of it.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // A failed delete leaves the card in place; show why, then fade out.
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  function remove() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(productId));
      if (afterDeleteHref) formData.set("redirect_to", afterDeleteHref);
      // On success the page either revalidates (the card disappears with it)
      // or, with redirect_to set, the action navigates away — in which case
      // the result never arrives, hence the optional chaining.
      const result = await deleteProduct(formData);
      setConfirming(false);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Gerir "${productName}"`}
        aria-expanded={open}
        className={`flex h-8 w-8 items-center justify-center transition ${
          overlay
            ? "text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] hover:text-white"
            : "text-ink-soft hover:text-ink"
        }`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-36 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg">
          <Link
            href={`/admin/produtos?editar=${productId}`}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm font-semibold text-ink-soft transition hover:bg-mist hover:text-ink"
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setConfirming(true);
            }}
            className="block w-full px-4 py-2 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50"
          >
            Remover
          </button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="absolute right-0 mt-1 w-48 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 shadow-lg"
        >
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirming}
        title={`Apagar "${productName}"?`}
        description="Esta ação não pode ser anulada e remove também as imagens do produto. Para o esconder do site sem o perder, edite-o e desligue 'Visível no site'."
        pending={pending}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
