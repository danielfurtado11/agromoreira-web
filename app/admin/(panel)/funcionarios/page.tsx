import { getEmployees, getStores } from "@/lib/api/queries";
import { EmployeesManager } from "./EmployeesManager";

export default async function AdminEmployeesPage() {
  // Employees carry their store, and the form needs the full store list for
  // its dropdown — both come from the public endpoints (nothing is hidden).
  const [employees, stores] = await Promise.all([getEmployees(), getStores()]);

  return (
    <div className="max-w-3xl">
      <EmployeesManager employees={employees} stores={stores} />
    </div>
  );
}
