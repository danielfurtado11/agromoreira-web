"use client";

import { useState, useTransition } from "react";
import type { Brand } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { HiddenBadge } from "@/components/admin/HiddenBadge";
import { Modal } from "@/components/Modal";
import { BrandForm } from "./BrandForm";
import { createBrand, deleteBrand, updateBrand } from "./actions";

/** Nothing open, creating, or editing a brand. */
type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; brand: Brand; notice?: string };

/**
 * The brands list plus the create/edit window, mirroring StoresManager.
 *
 * The list rows carry the full brand, so the edit window opens instantly. The
 * copy in the modal state can go stale after a logo upload, so the render below
 * prefers the same brand from the freshly revalidated list.
 */
export function BrandsManager({ brands }: { brands: Brand[] }) {
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });

  const editingBrand =
    modal.mode === "edit"
      ? (brands.find((brand) => brand.id === modal.brand.id) ?? modal.brand)
      : undefined;

  /**
   * Creating with a logo is one action for the admin, but a create followed by
   * an upload. Everything through: close. Logo left behind: reopen on the saved
   * brand, explain, and let it be retried — the brand itself is safe either way.
   */
  function afterCreate(brand: Brand, logoFailed: boolean) {
    if (!logoFailed) {
      setModal({ mode: "closed" });
      return;
    }
    setModal({
      mode: "edit",
      brand,
      notice:
        "Marca criada, mas o logótipo não foi enviado. Pode tentar de novo aqui.",
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Marcas</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {brands.length} {brands.length === 1 ? "marca" : "marcas"}. Aparecem
            no carrossel no fundo da página inicial.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-deep"
        >
          Adicionar marca
        </button>
      </div>

      {brands.length > 0 ? (
        <ul className="mt-6 max-h-[60vh] divide-y divide-line overflow-y-auto rounded-2xl border border-line bg-white">
          {brands.map((brand) => (
            <BrandRow
              key={brand.id}
              brand={brand}
              onEdit={() => setModal({ mode: "edit", brand })}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-ink-soft">
          Ainda não há marcas. Crie a primeira acima.
        </p>
      )}

      <Modal
        open={modal.mode !== "closed"}
        title={modal.mode === "edit" ? "Editar marca" : "Nova marca"}
        onClose={() => setModal({ mode: "closed" })}
      >
        {modal.mode === "create" && (
          <BrandForm
            action={createBrand}
            submitLabel="Criar marca"
            onCancel={() => setModal({ mode: "closed" })}
            onSaved={afterCreate}
          />
        )}

        {modal.mode === "edit" && editingBrand && (
          <BrandForm
            // Remount when switching brand so the fields reset.
            key={editingBrand.id}
            brand={editingBrand}
            action={updateBrand}
            submitLabel="Guardar alterações"
            notice={modal.notice}
            onCancel={() => setModal({ mode: "closed" })}
            onSaved={() => setModal({ mode: "closed" })}
          />
        )}
      </Modal>
    </>
  );
}

/** One brand in the list: logo, name and order, plus edit/delete. */
function BrandRow({ brand, onEdit }: { brand: Brand; onEdit: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(brand.id));
      const result = await deleteBrand(formData);
      setConfirming(false);
      if (result.error) setError(result.error);
    });
  }

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        {brand.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.image_url}
            alt={`Logótipo de ${brand.name}`}
            className="h-12 w-16 rounded-lg border border-line bg-white object-contain p-1"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-12 w-16 items-center justify-center rounded-lg border border-dashed border-line text-xs text-ink-soft"
          >
            Sem logo
          </div>
        )}

        <div className="min-w-56 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold">
            {brand.name}
            {!brand.is_active && <HiddenBadge />}
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">
            {brand.display_order != null
              ? `Ordem ${brand.display_order}`
              : "Sem ordem definida"}
          </p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-primary hover:text-primary"
        >
          Editar
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
        title={`Apagar "${brand.name}"?`}
        description="Esta ação não pode ser anulada e remove também o logótipo. Para esconder a marca temporariamente, edite-a e desmarque «Visível no site»."
        pending={pending}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </li>
  );
}
