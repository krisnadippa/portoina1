import { getPayrollPeriod } from "@/lib/actions/payroll";
import { PayrollDetail } from "@/components/payroll/PayrollDetail";
import { notFound } from "next/navigation";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PayrollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const period = await getPayrollPeriod(id);
  if (!period) notFound();
  return <PayrollDetail period={serialize(period)} />;
}

