import { getTransactions } from "@/lib/actions/transactions";
import { getEmployees } from "@/lib/actions/employees";
import { TransactionPage } from "@/components/transactions/TransactionPage";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PotonganPage() {
  const [transactions, employees] = await Promise.all([
    getTransactions({ type: "POTONGAN" }),
    getEmployees(),
  ]);

  return (
    <TransactionPage
      type="POTONGAN"
      title="Potongan Lainnya"
      description="Kelola potongan khusus seperti denda, pinjaman, dan ketidakhadiran"
      transactions={serialize(transactions)}
      employees={serialize(employees)}
    />
  );
}

