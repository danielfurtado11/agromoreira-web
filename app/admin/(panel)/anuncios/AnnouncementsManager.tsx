"use client";

import { useState, useTransition } from "react";
import type { Announcement } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Modal } from "@/components/Modal";
import { HiddenBadge } from "@/components/admin/HiddenBadge";
import { formatDate } from "@/lib/format";
import { AnnouncementForm } from "./AnnouncementForm";
import {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from "./actions";

/** Nothing open, creating, or editing an announcement. */
type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; announcement: Announcement };

/**
 * The announcements list plus the create/edit window. The list includes hidden
 * announcements (loaded with the admin token), marked with the hidden icon;
 * every visible one shows on the site, rotating in the top bar.
 */
export function AnnouncementsManager({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Anúncios</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Avisos na barra do topo do site (ex.: horários de feriado). Todos os
            que estão visíveis aparecem à vez, a alternar de 10 em 10 segundos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-deep"
        >
          Adicionar aviso
        </button>
      </div>

      {announcements.length > 0 ? (
        <ul className="mt-6 max-h-[60vh] divide-y divide-line overflow-y-auto rounded-2xl border border-line bg-white">
          {announcements.map((announcement) => (
            <AnnouncementRow
              key={announcement.id}
              announcement={announcement}
              onEdit={() => setModal({ mode: "edit", announcement })}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-ink-soft">
          Ainda não há avisos. Crie o primeiro acima.
        </p>
      )}

      <Modal
        open={modal.mode !== "closed"}
        title={modal.mode === "edit" ? "Editar aviso" : "Novo aviso"}
        onClose={() => setModal({ mode: "closed" })}
      >
        {modal.mode === "create" && (
          <AnnouncementForm
            action={createAnnouncement}
            submitLabel="Criar aviso"
            onCancel={() => setModal({ mode: "closed" })}
            onSaved={() => setModal({ mode: "closed" })}
          />
        )}

        {modal.mode === "edit" && (
          <AnnouncementForm
            // Remount when switching announcement so the fields reset.
            key={modal.announcement.id}
            announcement={modal.announcement}
            action={updateAnnouncement}
            submitLabel="Guardar alterações"
            onCancel={() => setModal({ mode: "closed" })}
            onSaved={() => setModal({ mode: "closed" })}
          />
        )}
      </Modal>
    </>
  );
}

/** One announcement in the list: title, message, date and status. */
function AnnouncementRow({
  announcement,
  onEdit,
}: {
  announcement: Announcement;
  onEdit: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(announcement.id));
      const result = await deleteAnnouncement(formData);
      setConfirming(false);
      if (result.error) setError(result.error);
    });
  }

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-56 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{announcement.title}</span>
            {!announcement.is_active && <HiddenBadge />}
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-ink-soft">
            {formatDate(announcement.created_at)} · {announcement.message}
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
        title={`Apagar "${announcement.title}"?`}
        description="Esta ação não pode ser anulada. Para o esconder do site sem o perder, edite-o e desligue 'Visível no site'."
        pending={pending}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </li>
  );
}
