"use client";

import { useEffect, useRef } from "react";

/**
 * A confirmation dialog styled like the rest of the site, replacing the
 * browser's `confirm()`.
 *
 * Built on the native <dialog> element opened with showModal(), which gives us
 * focus trapping, Esc-to-close and an inert background for free — all things
 * that are easy to get wrong when hand-rolling a modal.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Apagar",
  pendingLabel = "A apagar...",
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  pendingLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      // Fired by Esc: cancel the default close so React stays the source of
      // truth for `open`.
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onCancel();
      }}
      // `m-auto` is what centres it: the browser's own dialog styles rely on
      // `margin: auto`, which Tailwind's preflight reset strips from every
      // element — without it the dialog sticks to the top-left corner.
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-line bg-white p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="p-6">
        <h2 className="text-lg font-bold">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-ink-soft">{description}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-ink-soft hover:text-ink disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
