"use client";

import { useEffect, useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { ActionResult } from "@/lib/admin";

/**
 * Manages a list of records whose only editable field is a name — today,
 * categories and units, which are identical in shape.
 *
 * Sharing this matters: the interaction here was reworked several times
 * (on-demand add field, read-only until "Editar", custom confirm dialog). With
 * one copy per entity, each of those changes would have had to be made twice,
 * and the two would eventually drift apart.
 *
 * The Server Actions are passed in by each page, so this component knows
 * nothing about endpoints or which pages to revalidate.
 *
 * Note: the success wording assumes a feminine noun ("Categoria adicionada",
 * "Unidade adicionada"), which both current users satisfy.
 */
export type NameItem = { id: number; name: string };

export type NameListLabels = {
  /** Button that reveals the add field, e.g. "Adicionar categoria". */
  addButton: string;
  /** Placeholder for the name field, e.g. "Nome da categoria". */
  placeholder: string;
  /** Feminine noun used in messages, e.g. "Categoria". */
  noun: string;
  /** Extra warning inside the delete dialog. */
  deleteWarning: string;
  /** Shown when there is nothing yet. */
  empty: string;
};

type Action = (formData: FormData) => Promise<ActionResult>;

const INPUT_CLASS =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-primary";

const BUTTON_PRIMARY =
  "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-deep disabled:opacity-60";
const BUTTON_QUIET =
  "rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-ink-soft hover:text-ink disabled:opacity-60";
const BUTTON_DANGER =
  "rounded-full border border-line px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50";

/** How long a success message stays on screen. */
const NOTICE_MS = 4000;

function useAutoClear(notice: string | null, clear: () => void) {
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(clear, NOTICE_MS);
    return () => clearTimeout(timer);
    // `clear` is a stable setter from useState.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice]);
}

export function NameListManager({
  items,
  labels,
  createAction,
  renameAction,
  removeAction,
}: {
  items: NameItem[];
  labels: NameListLabels;
  createAction: Action;
  renameAction: Action;
  removeAction: Action;
}) {
  return (
    <>
      <div className="mt-6">
        <CreateForm action={createAction} labels={labels} />
      </div>

      {items.length > 0 ? (
        <ul className="mt-6 max-h-[60vh] divide-y divide-line overflow-y-auto rounded-2xl border border-line bg-white">
          {items.map((item) => (
            <NameRow
              key={item.id}
              item={item}
              labels={labels}
              renameAction={renameAction}
              removeAction={removeAction}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-ink-soft">{labels.empty}</p>
      )}
    </>
  );
}

/** Shows only a button until pressed; the field appears on demand. */
function CreateForm({
  action,
  labels,
}: {
  action: Action;
  labels: NameListLabels;
}) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useAutoClear(notice, () => setNotice(null));

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      setNotice(`${labels.noun} "${formData.get("name")}" adicionada.`);
      setAdding(false);
    });
  }

  if (!adding) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            setNotice(null);
          }}
          className={BUTTON_PRIMARY}
        >
          {labels.addButton}
        </button>
        <Feedback error={error} notice={notice} />
      </div>
    );
  }

  return (
    <form action={submit}>
      <div className="flex flex-wrap items-center gap-2">
        <input
          name="name"
          placeholder={labels.placeholder}
          required
          autoFocus
          aria-label={labels.placeholder}
          className={`${INPUT_CLASS} min-w-56 flex-1`}
        />
        <button type="submit" disabled={pending} className={BUTTON_PRIMARY}>
          {pending ? "A adicionar..." : "Adicionar"}
        </button>
        <button
          type="button"
          onClick={() => {
            setAdding(false);
            setError(null);
          }}
          disabled={pending}
          className={BUTTON_QUIET}
        >
          Cancelar
        </button>
      </div>
      <Feedback error={error} notice={notice} />
    </form>
  );
}

/** Read-only until "Editar" is pressed, so nothing changes by accident. */
function NameRow({
  item,
  labels,
  renameAction,
  removeAction,
}: {
  item: NameItem;
  labels: NameListLabels;
  renameAction: Action;
  removeAction: Action;
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useAutoClear(notice, () => setNotice(null));

  function save(formData: FormData) {
    startTransition(async () => {
      const result = await renameAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      setEditing(false);
      setNotice(`Nome alterado para "${formData.get("name")}".`);
    });
  }

  function remove() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(item.id));
      const result = await removeAction(formData);
      setConfirming(false);
      // On success the list revalidates and this row simply disappears.
      if (result.error) setError(result.error);
    });
  }

  return (
    <li className="p-4">
      {editing ? (
        <form action={save} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={item.id} />
          <input
            name="name"
            defaultValue={item.name}
            required
            autoFocus
            aria-label={`Nome: ${item.name}`}
            className={`${INPUT_CLASS} min-w-56 flex-1`}
          />
          <button type="submit" disabled={pending} className={BUTTON_PRIMARY}>
            {pending ? "A guardar..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError(null);
            }}
            disabled={pending}
            className={BUTTON_QUIET}
          >
            Cancelar
          </button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="min-w-56 flex-1 text-sm font-medium">
            {item.name}
          </span>
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setNotice(null);
            }}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-primary hover:text-primary"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={BUTTON_DANGER}
          >
            Apagar
          </button>
        </div>
      )}

      <Feedback error={error} notice={notice} />

      <ConfirmDialog
        open={confirming}
        title={`Apagar "${item.name}"?`}
        description={labels.deleteWarning}
        pending={pending}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </li>
  );
}

function Feedback({
  error,
  notice,
}: {
  error: string | null;
  notice: string | null;
}) {
  if (error) {
    return (
      <p role="alert" className="mt-2 text-xs font-medium text-red-700">
        {error}
      </p>
    );
  }
  if (notice) {
    return (
      <p role="status" className="mt-2 text-xs font-medium text-primary">
        {notice}
      </p>
    );
  }
  return null;
}
