"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { Toast } from "@/components/Toast";
import { setProductFeatured } from "@/app/admin/(panel)/produtos/actions";

/**
 * Star over a product card (signed-in admins only) that toggles whether the
 * product is featured on the homepage: outline = not featured, filled =
 * featured.
 *
 * The star flips *optimistically*: useOptimistic shows the intended state
 * during the server round-trip, then hands back to the real value — which the
 * action's revalidation has meanwhile refreshed on success, or left unchanged
 * on failure (so the star snaps back and the error explains why).
 */
export function ProductCardStar({
  productId,
  productName,
  featured,
}: {
  productId: number;
  productName: string;
  featured: boolean;
}) {
  const [optimisticFeatured, setOptimisticFeatured] = useOptimistic(featured);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Show a failure for a moment, then fade out.
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  function toggle() {
    startTransition(async () => {
      const next = !optimisticFeatured;
      setOptimisticFeatured(next);

      const formData = new FormData();
      formData.set("id", String(productId));
      formData.set("featured", String(next));
      const result = await setProductFeatured(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setNotice(
        next
          ? `${productName} adicionado aos Destaques`
          : `${productName} removido dos Destaques`,
      );
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={optimisticFeatured}
        aria-label={
          optimisticFeatured
            ? `Remover "${productName}" dos destaques`
            : `Adicionar "${productName}" aos destaques`
        }
        title={
          optimisticFeatured
            ? "Remover dos destaques"
            : "Adicionar aos destaques"
        }
        // Always over a photo, so: white with a dark drop shadow when off,
        // and the accent green (same shadow) when featured.
        className={`flex h-8 w-8 items-center justify-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] transition ${
          optimisticFeatured ? "text-accent" : "text-white/90 hover:text-white"
        }`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={optimisticFeatured ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>

      {error && (
        <p
          role="alert"
          className="absolute right-0 mt-1 w-48 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 shadow-lg"
        >
          {error}
        </p>
      )}

      {notice && (
        <Toast message={notice} onDismiss={() => setNotice(null)} />
      )}
    </div>
  );
}
