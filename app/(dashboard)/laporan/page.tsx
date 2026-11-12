import { getFinancialReports } from "@/lib/actions/reports";
import { FinancialReport } from "@/components/reports/FinancialReport";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LaporanPage() {
  const data = await getFinancialReports({ year: 2026 });
  return <FinancialReport data={serialize(data)} />;
}

