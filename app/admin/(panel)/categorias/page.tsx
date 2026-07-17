import { getCategories } from "@/lib/api/queries";
import { NameListManager } from "@/components/admin/NameListManager";
import { createCategory, deleteCategory, renameCategory } from "./actions";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Categorias</h1>
      <p className="mt-1 text-sm text-ink-soft">
        As categorias agrupam os produtos no catálogo. Um produto tem de
        pertencer a uma.
      </p>

      <NameListManager
        items={categories}
        labels={{
          addButton: "Adicionar categoria",
          placeholder: "Nome da categoria",
          noun: "Categoria",
          deleteWarning:
            "Esta ação não pode ser anulada. Categorias com produtos associados não podem ser apagadas.",
          empty: "Ainda não há categorias. Crie a primeira acima.",
        }}
        createAction={createCategory}
        renameAction={renameCategory}
        removeAction={deleteCategory}
      />
    </div>
  );
}
