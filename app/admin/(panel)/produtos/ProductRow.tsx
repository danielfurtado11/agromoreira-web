"use client";

import { useState, useTransition } from "react";
import type { Product } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatPrice } from "@/lib/format";
import { deleteProduct } from "./actions";

/** One product in the panel list: a summary, plus edit/delete. */
export function ProductRow({
  product,
  loading,
  onEdit,
}: {
  product: Product;
  loading: boolean;
  onEdit: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSale = product.discount_price != null;

  function remove() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(product.id));
      const result = await deleteProduct(formData);
      setConfirming(false);
      if (result.error) setError(result.error);
    });
  }

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-56 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{product.name}</span>
            {!product.is_active && (
              <StatusIcon tone="muted" label="Oculto — não aparece no site">
                <HiddenIcon />
              </StatusIcon>
            )}
            {product.is_featured && (
              <StatusIcon tone="accent" label="Em destaque">
                <StarIcon />
              </StatusIcon>
            )}
            {onSale && (
              <StatusIcon tone="accent" label="Em promoção">
                <SaleIcon />
              </StatusIcon>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ink-soft">
            {product.category.name} ·{" "}
            <span className="tabular-nums">
              {formatPrice(onSale ? product.discount_price! : product.price)}
            </span>{" "}
            / {product.unit.name} · {product.images.length}{" "}
            {product.images.length === 1 ? "imagem" : "imagens"}
          </p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          disabled={loading}
          className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {loading ? "A abrir..." : "Editar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50"
        >
          Apagar
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-700">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirming}
        title={`Apagar "${product.name}"?`}
        description="Esta ação não pode ser anulada e remove também as imagens do produto. Para o esconder do site sem o perder, edite-o e desligue 'Visível no site'."
        pending={pending}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </li>
  );
}

/**
 * Small icon chip for a product state. The icon alone is not left to carry
 * the meaning: a native tooltip (`title`) explains it on hover, and the
 * sr-only text keeps it announced by screen readers.
 */
function StatusIcon({
  tone,
  label,
  children,
}: {
  tone: "muted" | "accent";
  label: string;
  children: React.ReactNode;
}) {
  const styles =
    tone === "accent"
      ? "bg-accent-soft text-accent-ink"
      : "bg-mist text-ink-soft";
  return (
    <span
      title={label}
      className={`flex h-5 w-5 items-center justify-center rounded-full ${styles}`}
    >
      {children}
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Shared frame so the three icons stay the same size and stroke. */
function IconSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function StarIcon() {
  return (
    <IconSvg>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </IconSvg>
  );
}

function SaleIcon() {
  return (
    <IconSvg>
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </IconSvg>
  );
}

function HiddenIcon() {
  return (
    <IconSvg>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </IconSvg>
  );
}
