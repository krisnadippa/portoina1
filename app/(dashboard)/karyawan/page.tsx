import { getEmployees } from "@/lib/actions/employees";
import { EmployeeList } from "@/components/employees/EmployeeList";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function KaryawanPage() {
  const employees = await getEmployees();
  return <EmployeeList employees={serialize(employees)} />;
}

