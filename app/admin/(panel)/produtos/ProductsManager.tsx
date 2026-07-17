"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  Category,
  Product,
  ProductDetail,
  Store,
  Unit,
} from "@/lib/api/types";
import { Modal } from "@/components/Modal";
import { ProductForm } from "./ProductForm";
import { ProductRow } from "./ProductRow";
import { createProduct, loadProduct, updateProduct } from "./actions";

/** Nothing open, creating, or editing a loaded product. */
type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; product: ProductDetail; notice?: string };

/**
 * The products list plus the create/edit window.
 *
 * Editing opens over the list rather than navigating away, so cancelling
 * simply puts you back where you were. The list row only carries a summary, so
 * opening the window loads the full product (stores and images included).
 */
export function ProductsManager({
  products,
  categories,
  units,
  stores,
  initialProduct,
  initialError,
  initialCreate = false,
  initialCategoryId,
}: {
  products: Product[];
  categories: Category[];
  units: Unit[];
  stores: Store[];
  /** Product to open for editing on arrival, loaded from `?editar=<id>`. */
  initialProduct?: ProductDetail;
  /** Shown when the `?editar=<id>` product could not be loaded. */
  initialError?: string;
  /** Open the create window on arrival (from the public site's "+" card). */
  initialCreate?: boolean;
  /** Category to pre-select in that create window (the one being browsed). */
  initialCategoryId?: number;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>(
    initialProduct
      ? { mode: "edit", product: initialProduct }
      : initialCreate
        ? { mode: "create" }
        : { mode: "closed" },
  );

  // Only pre-select a category that actually exists, so a stale link falls
  // back to "Escolher..." rather than an empty selection.
  const createCategoryId =
    initialCategoryId && categories.some((c) => c.id === initialCategoryId)
      ? initialCategoryId
      : undefined;
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(
    initialError ?? null,
  );
  // Category filter for the list; null means "show everything". Filtering is
  // done here on the client because the page already loads every product.
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const canCreate = categories.length > 0 && units.length > 0;

  const visibleProducts =
    categoryFilter === null
      ? products
      : products.filter((product) => product.category.id === categoryFilter);

  function openEdit(id: number) {
    setLoadingId(id);
    startTransition(async () => {
      // The id can be stale — e.g. a deep link to a product that has been
      // deleted meanwhile — so a failed load shows a message instead of
      // crashing the page.
      try {
        const product = await loadProduct(id);
        setLoadError(null);
        setModal({ mode: "edit", product });
      } catch {
        setLoadError(
          "Não foi possível abrir o produto. Pode já ter sido apagado.",
        );
      } finally {
        setLoadingId(null);
      }
    });
  }

  // The `?editar` deep link has done its job once the page arrives (the modal
  // state above already reflects it), so strip the param — otherwise a refresh
  // would reopen a window the admin had closed.
  const deepLinked =
    initialProduct !== undefined || initialError !== undefined || initialCreate;
  useEffect(() => {
    if (deepLinked) router.replace("/admin/produtos", { scroll: false });
    // Runs once on mount: the deep link only matters on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Re-reads the product so the window shows its images as they now are. */
  function refresh(id: number, notice?: string) {
    startTransition(async () => {
      const product = await loadProduct(id);
      setModal({ mode: "edit", product, notice });
    });
  }

  /**
   * Creating is presented as one action, but it is a create followed by one
   * upload per photo. Everything through: close. Photos left behind: keep the
   * window open on the saved product, explain, and let them be retried — the
   * product itself is safe either way.
   */
  function afterCreate(productId: number, failedUploads: number) {
    if (failedUploads === 0) {
      setModal({ mode: "closed" });
      return;
    }
    refresh(
      productId,
      failedUploads === 1
        ? "Produto criado, mas 1 fotografia não foi enviada. Pode tentar de novo aqui."
        : `Produto criado, mas ${failedUploads} fotografias não foram enviadas. Pode tentar de novo aqui.`,
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {products.length} {products.length === 1 ? "produto" : "produtos"},
            incluindo os que não estão disponíveis.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          disabled={!canCreate}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-deep disabled:opacity-60"
        >
          Adicionar produto
        </button>
      </div>

      {!canCreate && (
        <p className="mt-4 rounded-lg border border-accent/40 bg-accent-soft px-4 py-3 text-sm text-accent-ink">
          Antes de criar um produto tem de existir pelo menos uma categoria e
          uma unidade.
        </p>
      )}

      {loadError && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-700">
          {loadError}
        </p>
      )}

      {products.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <label
            htmlFor="category-filter"
            className="text-sm font-medium text-ink-soft"
          >
            Filtrar por categoria
          </label>
          <select
            id="category-filter"
            value={categoryFilter ?? ""}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-primary"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {categoryFilter !== null && (
            <span className="text-sm text-ink-soft">
              {visibleProducts.length} de {products.length}
            </span>
          )}
        </div>
      )}

      {visibleProducts.length > 0 ? (
        <ul className="mt-4 max-h-[60vh] divide-y divide-line overflow-y-auto rounded-2xl border border-line bg-white">
          {visibleProducts.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              loading={loadingId === product.id}
              onEdit={() => openEdit(product.id)}
            />
          ))}
        </ul>
      ) : products.length > 0 ? (
        <p className="mt-4 text-sm text-ink-soft">
          Nenhum produto nesta categoria.
        </p>
      ) : (
        <p className="mt-6 text-sm text-ink-soft">
          Ainda não há produtos. Crie o primeiro acima.
        </p>
      )}

      <Modal
        open={modal.mode !== "closed"}
        title={modal.mode === "edit" ? "Editar produto" : "Novo produto"}
        onClose={() => setModal({ mode: "closed" })}
      >
        {modal.mode === "create" && (
          <ProductForm
            categories={categories}
            units={units}
            stores={stores}
            initialCategoryId={createCategoryId}
            action={createProduct}
            submitLabel="Criar produto"
            onCancel={() => setModal({ mode: "closed" })}
            onSaved={afterCreate}
            onImagesChanged={() => {}}
          />
        )}

        {modal.mode === "edit" && (
          <ProductForm
            // Remount when switching product so the fields reset.
            key={modal.product.id}
            categories={categories}
            units={units}
            stores={stores}
            product={modal.product}
            action={updateProduct}
            submitLabel="Guardar alterações"
            notice={modal.notice}
            onCancel={() => setModal({ mode: "closed" })}
            onSaved={() => setModal({ mode: "closed" })}
            onImagesChanged={() => refresh(modal.product.id)}
          />
        )}
      </Modal>
    </>
  );
}
