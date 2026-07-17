import { getUnits } from "@/lib/api/queries";
import { NameListManager } from "@/components/admin/NameListManager";
import { createUnit, deleteUnit, renameUnit } from "./actions";

export default async function AdminUnitsPage() {
  const units = await getUnits();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Unidades</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Como cada produto é vendido — aparece a seguir ao preço (ex.: 12,50 € /
        saco 25kg). Um produto tem de ter uma.
      </p>

      <NameListManager
        items={units}
        labels={{
          addButton: "Adicionar unidade",
          placeholder: "Nome da unidade (ex.: litro)",
          noun: "Unidade",
          deleteWarning:
            "Esta ação não pode ser anulada. Unidades com produtos associados não podem ser apagadas.",
          empty: "Ainda não há unidades. Crie a primeira acima.",
        }}
        createAction={createUnit}
        renameAction={renameUnit}
        removeAction={deleteUnit}
      />
    </div>
  );
}
