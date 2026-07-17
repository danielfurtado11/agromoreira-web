"use server";

import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Employee } from "@/lib/api/types";
import type { ActionResult } from "@/lib/admin";

/**
 * Create and update also report the saved employee, so the window can move
 * straight on to the photo without waiting for the list to refresh.
 */
export type EmployeeActionResult = ActionResult & { employee?: Employee };

/**
 * Employees appear in the footer (name + phone) on every page, plus the
 * contacts and about pages — so a change must revalidate the whole tree, not a
 * fixed list of paths that would leave the footer stale elsewhere.
 */
function revalidateEmployees() {
  revalidatePath("/", "layout");
}

function messageFor(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}

type EmployeePayload = {
  name: string;
  description: string | null;
  contact: string;
  store_id: number;
};

/** Reads the form once; create and update share exactly the same fields. */
function readForm(formData: FormData): EmployeePayload | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "O nome não pode estar vazio." };

  const contact = String(formData.get("contact") ?? "").trim();
  if (!contact) return { error: "O contacto não pode estar vazio." };

  const storeId = Number(formData.get("store_id"));
  if (!storeId) return { error: "Escolha uma loja." };

  const description = String(formData.get("description") ?? "").trim();

  return {
    name,
    description: description === "" ? null : description,
    contact,
    store_id: storeId,
  };
}

export async function createEmployee(
  formData: FormData,
): Promise<EmployeeActionResult> {
  const payload = readForm(formData);
  if ("error" in payload) return payload;

  try {
    const created = await adminFetch<Employee>("/employees", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    revalidateEmployees();
    return { employee: created };
  } catch (error) {
    return { error: messageFor(error, "Não foi possível criar o funcionário.") };
  }
}

export async function updateEmployee(
  formData: FormData,
): Promise<EmployeeActionResult> {
  const id = Number(formData.get("id"));
  const payload = readForm(formData);
  if ("error" in payload) return payload;

  try {
    const saved = await adminFetch<Employee>(`/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    revalidateEmployees();
    return { employee: saved };
  } catch (error) {
    return {
      error: messageFor(error, "Não foi possível guardar o funcionário."),
    };
  }
}

export async function deleteEmployee(
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get("id"));

  try {
    await adminFetch(`/employees/${id}`, { method: "DELETE" });
  } catch (error) {
    return {
      error: messageFor(error, "Não foi possível apagar o funcionário."),
    };
  }

  revalidateEmployees();
  return {};
}

/** Sets or replaces the employee photo (the API keeps a single one). */
export async function uploadEmployeeImage(
  formData: FormData,
): Promise<ActionResult> {
  const employeeId = Number(formData.get("employee_id"));
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Escolha uma imagem." };
  }

  const upload = new FormData();
  upload.set("file", file);

  try {
    await adminFetch(`/employees/${employeeId}/image`, {
      method: "PUT",
      body: upload,
    });
  } catch (error) {
    return { error: messageFor(error, "Não foi possível enviar a fotografia.") };
  }

  revalidateEmployees();
  return {};
}

export async function deleteEmployeeImage(
  formData: FormData,
): Promise<ActionResult> {
  const employeeId = Number(formData.get("employee_id"));

  try {
    await adminFetch(`/employees/${employeeId}/image`, { method: "DELETE" });
  } catch (error) {
    return {
      error: messageFor(error, "Não foi possível remover a fotografia."),
    };
  }

  revalidateEmployees();
  return {};
}
