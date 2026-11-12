"use server";

import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { serialize } from "@/lib/utils";

export async function getFinancialReports(filters?: {
  month?: number;
  year?: number;
  employeeId?: string;
  type?: string;
}) {
  const whereTrx: Prisma.EmployeeTransactionWhereInput = { status: "DISETUJUI" };

  if (filters?.employeeId) {
    whereTrx.employeeId = filters.employeeId;
  }
  if (filters?.type && filters.type !== "ALL") {
    whereTrx.type = filters.type;
  }

  if (filters?.month && filters?.year) {
    whereTrx.date = {
      gte: new Date(filters.year, filters.month - 1, 1),
      lt: new Date(filters.year, filters.month, 1),
    };
  } else if (filters?.year) {
    whereTrx.date = {
      gte: new Date(filters.year, 0, 1),
      lt: new Date(filters.year + 1, 0, 1),
    };
  }

  const [transactions, employees, payrollPeriods] = await Promise.all([
    prisma.employeeTransaction.findMany({
      where: whereTrx,
      include: {
        employee: true,
        createdBy: true,
      },
      orderBy: { date: "desc" },
    }),
    prisma.employee.findMany({
      select: { id: true, name: true, employeeId: true, department: true },
    }),
    prisma.payrollPeriod.findMany({
      where: filters?.year ? { year: filters.year } : undefined,
      include: {
        details: true,
      },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    }),
  ]);

  // Aggregate metrics
  let totalBon = 0;
  let totalSalaryAdvance = 0;
  let totalBonusIncentive = 0;
  let totalOtherDeductions = 0;
  let totalDisbursed = 0;

  transactions.forEach((t) => {
    const amt = Number(t.amount);
    totalDisbursed += amt;
    if (t.type === "BON") totalBon += amt;
    if (t.type === "TOP_UP" || t.type === "TARIK_TUNAI") {
      if (t.effect === "PENGURANG_GAJI") totalSalaryAdvance += amt;
    }
    if (t.type === "BONUS" || t.type === "INSENTIF" || t.type === "LEMBUR") {
      totalBonusIncentive += amt;
    }
    if (t.type === "POTONGAN") totalOtherDeductions += amt;
  });

  // Calculate monthly payroll summary
  const monthlySummary = payrollPeriods.map((p) => {
    const gross = p.details.reduce((acc, d) => acc + Number(d.grossSalary), 0);
    const deductions = p.details.reduce((acc, d) => acc + Number(d.totalDeductions), 0);
    const net = p.details.reduce((acc, d) => acc + Number(d.netSalary), 0);
    return {
      month: p.month,
      year: p.year,
      grossSalary: gross,
      deductions,
      netSalary: net,
      employeeCount: p.details.length,
      status: p.status,
    };
  });

  return serialize({
    transactions,
    employees,
    monthlySummary,
    totals: {
      totalBon,
      totalSalaryAdvance,
      totalBonusIncentive,
      totalOtherDeductions,
      totalDisbursed,
    },
  });
}

