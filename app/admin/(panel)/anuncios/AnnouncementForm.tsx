"use client";

import { useState, useTransition } from "react";
import type { Announcement } from "@/lib/api/types";
import type { ActionResult } from "@/lib/admin";

const INPUT =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-primary";
const LABEL = "block text-sm font-medium";
const CHECKBOX = "h-4 w-4 accent-[var(--color-primary)]";

/**
 * The announcement form, shared by the create and edit windows. Just a title,
 * a message and a visibility toggle — no media — so it saves in one request.
 */
export function AnnouncementForm({
  announcement,
  action,
  submitLabel,
  onCancel,
  onSaved,
}: {
  /** Undefined when creating. */
  announcement?: Announcement;
  action: (formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      onSaved();
    });
  }

  return (
    <form action={submit} className="space-y-5">
      {announcement && (
        <input type="hidden" name="id" value={announcement.id} />
      )}

      <div>
        <label htmlFor="title" className={LABEL}>
          Título
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={announcement?.title ?? ""}
          placeholder="ex.: Horário de Natal"
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor="message" className={LABEL}>
          Mensagem
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={3}
          defaultValue={announcement?.message ?? ""}
          placeholder="ex.: Nos dias 24 e 31 fechamos às 13h."
          className={INPUT}
        />
      </div>

      <div className="border-t border-line pt-5">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_active"
            // New announcements are visible unless the admin says otherwise.
            defaultChecked={announcement?.is_active ?? true}
            className={CHECKBOX}
          />
          Visível no site
        </label>
        <p className="mt-1 text-xs text-ink-soft">
          Os avisos visíveis aparecem à vez na barra do topo do site.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-t border-line pt-5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-deep disabled:opacity-60"
        >
          {pending ? "A guardar..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-ink-soft hover:text-ink disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
