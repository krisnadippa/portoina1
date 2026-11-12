"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { serialize } from "@/lib/utils";

export async function getPayslips(filters?: {
  employeeId?: string;
  month?: number;
  year?: number;
}) {
  const where: Prisma.PayrollDetailWhereInput = {};

  if (filters?.employeeId) {
    where.employeeId = filters.employeeId;
  }

  if (filters?.month && filters?.year) {
    where.payrollPeriod = {
      month: filters.month,
      year: filters.year,
    };
  }

  // We can query from PayrollDetail which contains all the salary calculations
  const data = await prisma.payrollDetail.findMany({
    where,
    include: {
      employee: true,
      payrollPeriod: true,
      payslip: true,
    },
    orderBy: [
      { payrollPeriod: { year: "desc" } },
      { payrollPeriod: { month: "desc" } },
      { employee: { name: "asc" } },
    ],
  });
  return serialize(data);
}

export async function getPayslipById(detailId: string) {
  const detail = await prisma.payrollDetail.findUnique({
    where: { id: detailId },
    include: {
      employee: true,
      payrollPeriod: true,
      payslip: true,
    },
  });

  const companySettings = await prisma.companySetting.findMany();
  const settingsMap: Record<string, string> = {};
  companySettings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return serialize({
    detail,
    company: {
      name: settingsMap["company_name"] || "PT. Maju Bersama Indonesia",
      address: settingsMap["company_address"] || "Jl. Sudirman No. 123, Jakarta Pusat 10220",
      phone: settingsMap["company_phone"] || "+62 21 1234 5678",
      email: settingsMap["company_email"] || "info@majubersama.id",
    },
  });
}

