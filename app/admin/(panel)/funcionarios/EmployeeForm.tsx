"use client";

import { useState, useTransition } from "react";
import type { Employee, Store } from "@/lib/api/types";
import {
  PendingPhotoField,
  SavedPhotoField,
} from "@/components/admin/SinglePhotoField";
import {
  deleteEmployeeImage,
  uploadEmployeeImage,
  type EmployeeActionResult,
} from "./actions";

const INPUT =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-primary";
const LABEL = "block text-sm font-medium";

/**
 * The employee form, shared by the create and edit windows.
 *
 * Like the store form, the photo works the product way: while creating we hold
 * the chosen file in memory and upload it right after the employee is saved
 * (the upload endpoint needs an id); while editing, uploads take effect at once.
 */
export function EmployeeForm({
  employee,
  stores,
  action,
  submitLabel,
  notice,
  onCancel,
  onSaved,
}: {
  /** Undefined when creating. */
  employee?: Employee;
  stores: Store[];
  action: (formData: FormData) => Promise<EmployeeActionResult>;
  submitLabel: string;
  /** Message carried over from a previous step (e.g. a failed photo upload). */
  notice?: string;
  onCancel: () => void;
  /** `photoFailed` is true when the employee saved but the photo did not. */
  onSaved: (employee: Employee, photoFailed: boolean) => void;
}) {
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const busy = pending || uploading;

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);

      const saved = result.employee;
      if (!saved) return;

      // Creating with a photo: the employee exists now, so send the file held
      // in memory. A failed photo is recoverable (the window reopens to retry),
      // which beats losing the whole form.
      let photoFailed = false;
      if (pendingPhoto) {
        setUploading(true);
        const photoData = new FormData();
        photoData.set("employee_id", String(saved.id));
        photoData.set("file", pendingPhoto);
        const uploadResult = await uploadEmployeeImage(photoData);
        setUploading(false);
        photoFailed = Boolean(uploadResult.error);
      }

      onSaved(saved, photoFailed);
    });
  }

  return (
    <form action={submit} className="space-y-5">
      {employee && <input type="hidden" name="id" value={employee.id} />}

      <div>
        <label htmlFor="name" className={LABEL}>
          Nome
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={100}
          defaultValue={employee?.name ?? ""}
          className={INPUT}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact" className={LABEL}>
            Contacto
          </label>
          <input
            id="contact"
            name="contact"
            required
            maxLength={100}
            placeholder="ex.: 912 345 678"
            defaultValue={employee?.contact ?? ""}
            className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="store_id" className={LABEL}>
            Loja
          </label>
          <select
            id="store_id"
            name="store_id"
            required
            defaultValue={employee?.store.id ?? ""}
            className={INPUT}
          >
            <option value="" disabled>
              Escolher...
            </option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className={LABEL}>
          Descrição (opcional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Função, área de que trata, ..."
          defaultValue={employee?.description ?? ""}
          className={INPUT}
        />
      </div>

      <div className="border-t border-line pt-5">
        {employee ? (
          <SavedPhotoField
            entityId={employee.id}
            entityName={employee.name}
            imageUrl={employee.image_url}
            idField="employee_id"
            uploadAction={uploadEmployeeImage}
            deleteAction={deleteEmployeeImage}
          />
        ) : (
          <PendingPhotoField
            file={pendingPhoto}
            onChange={setPendingPhoto}
            hint="É enviada ao criar o funcionário."
          />
        )}
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-lg border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-accent-ink"
        >
          {notice}
        </p>
      )}

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
          disabled={busy}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-deep disabled:opacity-60"
        >
          {uploading
            ? "A enviar fotografia..."
            : pending
              ? "A guardar..."
              : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-ink-soft hover:text-ink disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
