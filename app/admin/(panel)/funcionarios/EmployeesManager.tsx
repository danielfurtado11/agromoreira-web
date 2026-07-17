"use client";

import { useState, useTransition } from "react";
import type { Employee, Store } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Modal } from "@/components/Modal";
import { EmployeeForm } from "./EmployeeForm";
import { createEmployee, deleteEmployee, updateEmployee } from "./actions";

/** Nothing open, creating, or editing an employee. */
type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; employee: Employee; notice?: string };

/**
 * The employees list plus the create/edit window, mirroring StoresManager.
 *
 * An employee must belong to a store, so creating is only offered once at
 * least one store exists — the same guard products use for categories/units.
 */
export function EmployeesManager({
  employees,
  stores,
}: {
  employees: Employee[];
  stores: Store[];
}) {
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });

  const canCreate = stores.length > 0;

  const editingEmployee =
    modal.mode === "edit"
      ? (employees.find((e) => e.id === modal.employee.id) ?? modal.employee)
      : undefined;

  /**
   * Creating with a photo is one action, but a create followed by an upload.
   * Everything through: close. Photo left behind: reopen on the saved
   * employee, explain, and let it be retried — the record itself is safe.
   */
  function afterCreate(employee: Employee, photoFailed: boolean) {
    if (!photoFailed) {
      setModal({ mode: "closed" });
      return;
    }
    setModal({
      mode: "edit",
      employee,
      notice:
        "Funcionário criado, mas a fotografia não foi enviada. Pode tentar de novo aqui.",
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Funcionários</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {employees.length}{" "}
            {employees.length === 1 ? "funcionário" : "funcionários"}. Aparecem
            na página de contactos, com o telefone direto.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          disabled={!canCreate}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-deep disabled:opacity-60"
        >
          Adicionar funcionário
        </button>
      </div>

      {!canCreate && (
        <p className="mt-4 rounded-lg border border-accent/40 bg-accent-soft px-4 py-3 text-sm text-accent-ink">
          Antes de adicionar um funcionário tem de existir pelo menos uma loja.
        </p>
      )}

      {employees.length > 0 ? (
        <ul className="mt-6 max-h-[60vh] divide-y divide-line overflow-y-auto rounded-2xl border border-line bg-white">
          {employees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              onEdit={() => setModal({ mode: "edit", employee })}
            />
          ))}
        </ul>
      ) : (
        canCreate && (
          <p className="mt-6 text-sm text-ink-soft">
            Ainda não há funcionários. Crie o primeiro acima.
          </p>
        )
      )}

      <Modal
        open={modal.mode !== "closed"}
        title={modal.mode === "edit" ? "Editar funcionário" : "Novo funcionário"}
        onClose={() => setModal({ mode: "closed" })}
      >
        {modal.mode === "create" && (
          <EmployeeForm
            stores={stores}
            action={createEmployee}
            submitLabel="Criar funcionário"
            onCancel={() => setModal({ mode: "closed" })}
            onSaved={afterCreate}
          />
        )}

        {modal.mode === "edit" && editingEmployee && (
          <EmployeeForm
            // Remount when switching employee so the fields reset.
            key={editingEmployee.id}
            employee={editingEmployee}
            stores={stores}
            action={updateEmployee}
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

/** One employee in the list: photo, name, store and contact, plus edit/delete. */
function EmployeeRow({
  employee,
  onEdit,
}: {
  employee: Employee;
  onEdit: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(employee.id));
      const result = await deleteEmployee(formData);
      setConfirming(false);
      if (result.error) setError(result.error);
    });
  }

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        {employee.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={employee.image_url}
            alt={`Fotografia de ${employee.name}`}
            className="h-12 w-12 rounded-full border border-line object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-line text-[10px] text-ink-soft"
          >
            Sem foto
          </div>
        )}

        <div className="min-w-56 flex-1">
          <p className="text-sm font-semibold">{employee.name}</p>
          <p className="mt-0.5 text-xs text-ink-soft">
            {employee.store.name} · {employee.contact}
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
        title={`Apagar "${employee.name}"?`}
        description="Esta ação não pode ser anulada e remove também a fotografia do funcionário."
        pending={pending}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </li>
  );
}
