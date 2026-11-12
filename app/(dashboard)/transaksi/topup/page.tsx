import { getTransactions } from "@/lib/actions/transactions";
import { getEmployees } from "@/lib/actions/employees";
import { TransactionPage } from "@/components/transactions/TransactionPage";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TopUpPage() {
  const [transactions, employees] = await Promise.all([
    getTransactions({ type: "TOP_UP" }),
    getEmployees(),
  ]);

  return (
    <TransactionPage
      type="TOP_UP"
      title="Top Up Dana"
      description="Kelola pemberian atau pengisian dana kepada karyawan"
      transactions={serialize(transactions)}
      employees={serialize(employees)}
    />
  );
}

