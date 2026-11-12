import { getTransactions } from "@/lib/actions/transactions";
import { getEmployees } from "@/lib/actions/employees";
import { TransactionPage } from "@/components/transactions/TransactionPage";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TarikTunaiPage() {
  const [transactions, employees] = await Promise.all([
    getTransactions({ type: "TARIK_TUNAI" }),
    getEmployees(),
  ]);

  return (
    <TransactionPage
      type="TARIK_TUNAI"
      title="Tarik Tunai"
      description="Kelola penarikan uang tunai oleh karyawan"
      transactions={serialize(transactions)}
      employees={serialize(employees)}
    />
  );
}

