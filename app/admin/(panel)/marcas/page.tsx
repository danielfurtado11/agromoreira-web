import { getAdminBrands } from "@/lib/api/admin";
import { BrandsManager } from "./BrandsManager";

export default async function AdminBrandsPage() {
  // Include hidden brands: the panel manages them, the public feed does not.
  const brands = await getAdminBrands();

  return (
    <div className="max-w-3xl">
      <BrandsManager brands={brands} />
    </div>
  );
}
