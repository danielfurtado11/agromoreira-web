"use client";

import { useState, useTransition } from "react";
import type { Store } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Modal } from "@/components/Modal";
import { StoreForm } from "./StoreForm";
import { createStore, deleteStore, updateStore } from "./actions";

/** Nothing open, creating, or editing a store. */
type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; store: Store; notice?: string };

/**
 * The stores list plus the create/edit window, mirroring ProductsManager.
 *
 * Unlike products, the list rows already carry the full store (there is no
 * separate detail endpoint to call), so the edit window opens instantly. The
 * copy held in the modal state can go stale after a photo upload, though —
 * the render below prefers the same store from the freshly revalidated list.
 */
export function StoresManager({ stores }: { stores: Store[] }) {
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });

  const editingStore =
    modal.mode === "edit"
      ? (stores.find((store) => store.id === modal.store.id) ?? modal.store)
      : undefined;

  /**
   * Creating with a photo is one action, but a create followed by an upload.
   * Everything through: close. Photo left behind: reopen on the saved store,
   * explain, and let it be retried — the store itself is safe either way.
   */
  function afterCreate(store: Store, photoFailed: boolean) {
    if (!photoFailed) {
      setModal({ mode: "closed" });
      return;
    }
    setModal({
      mode: "edit",
      store,
      notice:
        "Loja criada, mas a fotografia não foi enviada. Pode tentar de novo aqui.",
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lojas</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {stores.length} {stores.length === 1 ? "loja" : "lojas"}. A morada e
            o horário aparecem no rodapé e na página de contactos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-deep"
        >
          Adicionar loja
        </button>
      </div>

      {stores.length > 0 ? (
        <ul className="mt-6 max-h-[60vh] divide-y divide-line overflow-y-auto rounded-2xl border border-line bg-white">
          {stores.map((store) => (
            <StoreRow
              key={store.id}
              store={store}
              onEdit={() => setModal({ mode: "edit", store })}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-ink-soft">
          Ainda não há lojas. Crie a primeira acima.
        </p>
      )}

      <Modal
        open={modal.mode !== "closed"}
        title={modal.mode === "edit" ? "Editar loja" : "Nova loja"}
        onClose={() => setModal({ mode: "closed" })}
      >
        {modal.mode === "create" && (
          <StoreForm
            action={createStore}
            submitLabel="Criar loja"
            onCancel={() => setModal({ mode: "closed" })}
            onSaved={afterCreate}
          />
        )}

        {modal.mode === "edit" && editingStore && (
          <StoreForm
            // Remount when switching store so the fields reset.
            key={editingStore.id}
            store={editingStore}
            action={updateStore}
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

/** One store in the list: photo, name and address, plus edit/delete. */
function StoreRow({ store, onEdit }: { store: Store; onEdit: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(store.id));
      const result = await deleteStore(formData);
      setConfirming(false);
      if (result.error) setError(result.error);
    });
  }

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        {store.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.image_url}
            alt={`Fotografia de ${store.name}`}
            className="h-12 w-16 rounded-lg border border-line object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-12 w-16 items-center justify-center rounded-lg border border-dashed border-line text-xs text-ink-soft"
          >
            Sem foto
          </div>
        )}

        <div className="min-w-56 flex-1">
          <p className="text-sm font-semibold">{store.name}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{store.address}</p>
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
        title={`Apagar "${store.name}"?`}
        description="Esta ação não pode ser anulada e remove também a fotografia da loja. Lojas com produtos ou funcionários associados não podem ser apagadas."
        pending={pending}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </li>
  );
}
