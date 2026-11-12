import { getPayrollPeriods } from "@/lib/actions/payroll";
import { PayrollList } from "@/components/payroll/PayrollList";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PenggajianPage() {
  const periods = await getPayrollPeriods();
  return <PayrollList periods={serialize(periods)} />;
}

