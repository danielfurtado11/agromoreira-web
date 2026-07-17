import { adminFetch, getAdminProducts } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { getCategories, getStores, getUnits } from "@/lib/api/queries";
import type { ProductDetail } from "@/lib/api/types";
import { ProductsManager } from "./ProductsManager";

/** `?editar=<id>` deep-links straight into that product's edit window. */
type SearchParams = Promise<{ editar?: string }>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { editar } = await searchParams;
  const editId = Number(editar);

  // Loading the deep-linked product here, on the server, means the edit
  // window opens already filled — no client-side effect or extra round-trip.
  let initialProduct: ProductDetail | undefined;
  let initialError: string | undefined;
  if (Number.isInteger(editId) && editId > 0) {
    try {
      initialProduct = await adminFetch<ProductDetail>(`/products/${editId}`);
    } catch (error) {
      // An expired session signals by throwing a redirect — let that through.
      // Only an API error means the product itself could not be loaded.
      if (!(error instanceof ApiError)) throw error;
      initialError =
        "Não foi possível abrir o produto. Pode já ter sido apagado.";
    }
  }

  // Unavailable products must be listed here, or there would be no way back
  // once one is switched off. That needs the admin token, hence
  // getAdminProducts. The rest fills the form's dropdowns.
  const [products, categories, units, stores] = await Promise.all([
    getAdminProducts(),
    getCategories(),
    getUnits(),
    getStores(),
  ]);

  return (
    <div className="max-w-3xl">
      <ProductsManager
        products={products}
        categories={categories}
        units={units}
        stores={stores}
        initialProduct={initialProduct}
        initialError={initialError}
      />
    </div>
  );
}
