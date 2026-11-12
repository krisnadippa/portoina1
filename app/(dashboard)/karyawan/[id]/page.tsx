import { getEmployee, getEmployeeStats } from "@/lib/actions/employees";
import { EmployeeDetail } from "@/components/employees/EmployeeDetail";
import { notFound } from "next/navigation";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [employee, stats] = await Promise.all([
    getEmployee(id),
    getEmployeeStats(id),
  ]);

  if (!employee) notFound();

  return <EmployeeDetail employee={serialize(employee)} stats={serialize(stats)} />;
}

