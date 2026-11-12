import { getPayslips } from "@/lib/actions/payslips";
import { PayslipList } from "@/components/payslip/PayslipList";
import prisma from "@/lib/db";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SlipGajiPage({
  searchParams,
}: {
  searchParams: Promise<{ detailId?: string; employeeId?: string }>;
}) {
  const params = await searchParams;
  const payslips = await getPayslips({
    employeeId: params.employeeId,
  });

  const companySettings = await prisma.companySetting.findMany();
  const settingsMap: Record<string, string> = {};
  companySettings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  const company = {
    name: settingsMap["company_name"] || "PT. Maju Bersama Indonesia",
    address: settingsMap["company_address"] || "Jl. Sudirman No. 123, Jakarta Pusat 10220",
    phone: settingsMap["company_phone"] || "+62 21 1234 5678",
    email: settingsMap["company_email"] || "info@majubersama.id",
  };

  return (
    <PayslipList
      payslips={serialize(payslips)}
      company={serialize(company)}
      selectedDetailId={params.detailId}
    />
  );
}

