import { getStores } from "@/lib/api/queries";
import { StoresManager } from "./StoresManager";

export default async function AdminStoresPage() {
  // The public endpoint already returns everything the panel needs (address,
  // hours, photo); unlike products, stores are never hidden from visitors.
  const stores = await getStores();

  return (
    <div className="max-w-3xl">
      <StoresManager stores={stores} />
    </div>
  );
}
