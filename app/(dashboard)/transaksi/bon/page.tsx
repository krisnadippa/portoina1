import { getTransactions } from "@/lib/actions/transactions";
import { getEmployees } from "@/lib/actions/employees";
import { TransactionPage } from "@/components/transactions/TransactionPage";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BonPage() {
  const [transactions, employees] = await Promise.all([
    getTransactions({ type: "BON" }),
    getEmployees(),
  ]);

  return (
    <TransactionPage
      type="BON"
      title="Bon / Kasbon"
      description="Kelola pengambilan uang kasbon karyawan"
      transactions={serialize(transactions)}
      employees={serialize(employees)}
    />
  );
}

