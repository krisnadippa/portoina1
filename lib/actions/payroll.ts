"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { serialize } from "@/lib/utils";

export async function getPayrollPeriods() {
  const data = await prisma.payrollPeriod.findMany({
    include: {
      details: {
        include: { employee: true },
      },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
  return serialize(data);
}

export async function getPayrollPeriod(id: string) {
  const data = await prisma.payrollPeriod.findUnique({
    where: { id },
    include: {
      details: {
        include: { employee: true, payslip: true },
        orderBy: { employee: { name: "asc" } },
      },
      transactions: {
        include: { employee: true },
      },
    },
  });
  return serialize(data);
}

export async function createOrGetPayrollPeriod(month: number, year: number) {
  const period = await prisma.payrollPeriod.upsert({
    where: { month_year: { month, year } },
    update: {},
    create: { month, year, status: "DRAFT" },
  });
  return serialize(period);
}

/**
 * Recalculate a single employee's payroll detail immediately when a transaction is added or deleted
 */
export async function recalculateEmployeePayroll(employeeId: string, periodId: string) {
  try {
    const [employee, period] = await Promise.all([
      prisma.employee.findUnique({ where: { id: employeeId } }),
      prisma.payrollPeriod.findUnique({ where: { id: periodId } }),
    ]);

    if (!employee || !period) return;

    // Get all transactions for this employee and period
    const transactions = await prisma.employeeTransaction.findMany({
      where: {
        employeeId,
        payrollPeriodId: periodId,
        status: { in: ["DISETUJUI", "CICILAN", "PENDING"] },
      },
    });

    const bonus = transactions
      .filter((t) => t.type === "BONUS" && t.effect === "PENAMBAH_GAJI")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const incentive = transactions
      .filter((t) => t.type === "INSENTIF" && t.effect === "PENAMBAH_GAJI")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const overtime = transactions
      .filter((t) => t.type === "LEMBUR" && t.effect === "PENAMBAH_GAJI")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const otherIncome = transactions
      .filter(
        (t) =>
          ["KOMISI", "TUNJANGAN_TAMBAHAN"].includes(t.type) &&
          t.effect === "PENAMBAH_GAJI"
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const grossSalary =
      Number(employee.baseSalary) +
      Number(employee.fixedAllowance) +
      bonus +
      incentive +
      overtime +
      otherIncome;

    const bon = transactions
      .filter((t) => t.type === "BON" && t.effect === "PENGURANG_GAJI")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const salaryAdvance = transactions
      .filter(
        (t) =>
          ["TOP_UP", "TARIK_TUNAI"].includes(t.type) &&
          t.effect === "PENGURANG_GAJI"
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const otherDeductions = transactions
      .filter((t) => t.type === "POTONGAN" && t.effect === "PENGURANG_GAJI")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalDeductions = bon + salaryAdvance + otherDeductions;
    const netSalary = Math.max(0, grossSalary - totalDeductions);

    const detail = await prisma.payrollDetail.upsert({
      where: {
        payrollPeriodId_employeeId: {
          payrollPeriodId: periodId,
          employeeId: employee.id,
        },
      },
      update: {
        baseSalary: new Prisma.Decimal(Number(employee.baseSalary)),
        fixedAllowance: new Prisma.Decimal(Number(employee.fixedAllowance)),
        bonus: new Prisma.Decimal(bonus),
        incentive: new Prisma.Decimal(incentive),
        overtime: new Prisma.Decimal(overtime),
        otherIncome: new Prisma.Decimal(otherIncome),
        grossSalary: new Prisma.Decimal(grossSalary),
        bon: new Prisma.Decimal(bon),
        salaryAdvance: new Prisma.Decimal(salaryAdvance),
        otherDeductions: new Prisma.Decimal(otherDeductions),
        totalDeductions: new Prisma.Decimal(totalDeductions),
        netSalary: new Prisma.Decimal(netSalary),
      },
      create: {
        payrollPeriodId: periodId,
        employeeId: employee.id,
        baseSalary: new Prisma.Decimal(Number(employee.baseSalary)),
        fixedAllowance: new Prisma.Decimal(Number(employee.fixedAllowance)),
        bonus: new Prisma.Decimal(bonus),
        incentive: new Prisma.Decimal(incentive),
        overtime: new Prisma.Decimal(overtime),
        otherIncome: new Prisma.Decimal(otherIncome),
        grossSalary: new Prisma.Decimal(grossSalary),
        bon: new Prisma.Decimal(bon),
        salaryAdvance: new Prisma.Decimal(salaryAdvance),
        otherDeductions: new Prisma.Decimal(otherDeductions),
        totalDeductions: new Prisma.Decimal(totalDeductions),
        netSalary: new Prisma.Decimal(netSalary),
        status: period.status === "DRAFT" ? "DRAFT" : "DIPROSES",
      },
    });

    // Also auto-update/create payslip so it immediately reflects on payslip page
    const periodLabel = `${period.year}-${String(period.month).padStart(2, "0")}`;
    await prisma.payslip.upsert({
      where: { payrollDetailId: detail.id },
      update: { isLocked: period.status === "MENUNGGU_PEMBAYARAN" || period.status === "DIBAYAR" },
      create: {
        payrollDetailId: detail.id,
        employeeId: employee.id,
        period: periodLabel,
        isLocked: false,
      },
    });
  } catch (err) {
    console.error("Error recalculating payroll detail:", err);
  }
}

export async function processPayroll(periodId: string) {
  try {
    const period = await prisma.payrollPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) return { success: false, error: "Periode tidak ditemukan" };
    if (period.status === "DIBAYAR") {
      return { success: false, error: "Periode sudah dibayar dan terkunci" };
    }

    const startDate = new Date(period.year, period.month - 1, 1);
    const endDate = new Date(period.year, period.month, 1);

    // Link any unallocated transactions that fall within this month/period
    await prisma.employeeTransaction.updateMany({
      where: {
        payrollPeriodId: null,
        date: { gte: startDate, lt: endDate },
      },
      data: { payrollPeriodId: periodId },
    });

    // Get all active employees
    const employees = await prisma.employee.findMany({
      where: { status: "AKTIF" },
    });

    // Recalculate each employee
    for (const emp of employees) {
      await recalculateEmployeePayroll(emp.id, periodId);
    }

    // Update period status
    await prisma.payrollPeriod.update({
      where: { id: periodId },
      data: { status: "DIPROSES", processedAt: new Date() },
    });

    revalidatePath("/penggajian");
    revalidatePath("/slip-gaji");
    revalidatePath("/laporan");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error processing payroll:", error);
    return { success: false, error: "Gagal memproses penggajian" };
  }
}

export async function lockPayroll(periodId: string) {
  try {
    const period = await prisma.payrollPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period || !["DIPROSES", "MENUNGGU_PEMBAYARAN"].includes(period.status)) {
      return { success: false, error: "Periode tidak dapat dikunci" };
    }

    await prisma.payrollPeriod.update({
      where: { id: periodId },
      data: { status: "MENUNGGU_PEMBAYARAN", lockedAt: new Date() },
    });

    // Generate payslips for all details
    const details = await prisma.payrollDetail.findMany({
      where: { payrollPeriodId: periodId },
      include: { employee: true, payrollPeriod: true },
    });

    for (const detail of details) {
      const periodLabel = `${detail.payrollPeriod.year}-${String(detail.payrollPeriod.month).padStart(2, "0")}`;

      await prisma.payslip.upsert({
        where: { payrollDetailId: detail.id },
        update: { isLocked: true },
        create: {
          payrollDetailId: detail.id,
          employeeId: detail.employeeId,
          period: periodLabel,
          isLocked: true,
        },
      });
    }

    revalidatePath("/penggajian");
    revalidatePath("/slip-gaji");
    return { success: true };
  } catch (error) {
    console.error("Error locking payroll:", error);
    return { success: false, error: "Gagal mengunci penggajian" };
  }
}

export async function markPayrollAsPaid(periodId: string) {
  try {
    await prisma.payrollPeriod.update({
      where: { id: periodId },
      data: { status: "DIBAYAR", paidAt: new Date() },
    });

    await prisma.payrollDetail.updateMany({
      where: { payrollPeriodId: periodId },
      data: { status: "DIBAYAR", paidAt: new Date() },
    });

    // Mark all kasbon (BON) transactions in this period as LUNAS
    await prisma.employeeTransaction.updateMany({
      where: {
        payrollPeriodId: periodId,
        type: "BON",
      },
      data: { status: "LUNAS" },
    });

    revalidatePath("/penggajian");
    revalidatePath("/transaksi/bon");
    revalidatePath("/slip-gaji");
    revalidatePath("/laporan");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error marking payroll as paid:", error);
    return { success: false, error: "Gagal menandai sebagai dibayar" };
  }
}

export async function getDashboardStats() {
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const [totalActiveEmployees, employees, thisMonthPeriod] = await Promise.all([
    prisma.employee.count({ where: { status: "AKTIF" } }),
    prisma.employee.findMany({ where: { status: "AKTIF" } }),
    prisma.payrollPeriod.findUnique({
      where: { month_year: { month: thisMonth, year: thisYear } },
      include: { details: true },
    }),
  ]);

  const totalMonthlySalary = employees.reduce(
    (sum, e) => sum + Number(e.baseSalary) + Number(e.fixedAllowance),
    0
  );

  const totalBon = await prisma.employeeTransaction.aggregate({
    where: {
      type: "BON",
      effect: "PENGURANG_GAJI",
      status: { notIn: ["LUNAS", "DITOLAK"] },
      date: {
        gte: new Date(thisYear, thisMonth - 1, 1),
        lt: new Date(thisYear, thisMonth, 1),
      },
    },
    _sum: { amount: true },
  });

  const totalFundsDisbursed = await prisma.employeeTransaction.aggregate({
    where: {
      date: {
        gte: new Date(thisYear, thisMonth - 1, 1),
        lt: new Date(thisYear, thisMonth, 1),
      },
      status: "DISETUJUI",
    },
    _sum: { amount: true },
  });

  const totalDeductions = await prisma.employeeTransaction.aggregate({
    where: {
      effect: "PENGURANG_GAJI",
      status: "DISETUJUI",
      date: {
        gte: new Date(thisYear, thisMonth - 1, 1),
        lt: new Date(thisYear, thisMonth, 1),
      },
    },
    _sum: { amount: true },
  });

  const totalAdditions = await prisma.employeeTransaction.aggregate({
    where: {
      effect: "PENAMBAH_GAJI",
      status: "DISETUJUI",
      date: {
        gte: new Date(thisYear, thisMonth - 1, 1),
        lt: new Date(thisYear, thisMonth, 1),
      },
    },
    _sum: { amount: true },
  });

  const grossSalary = totalMonthlySalary + Number(totalAdditions._sum.amount ?? 0);
  const totalNetSalaryDue = grossSalary - Number(totalDeductions._sum.amount ?? 0);

  return serialize({
    totalActiveEmployees,
    totalMonthlySalary,
    totalBon: Number(totalBon._sum.amount ?? 0),
    totalFundsDisbursed: Number(totalFundsDisbursed._sum.amount ?? 0),
    totalDeductionsThisMonth: Number(totalDeductions._sum.amount ?? 0),
    totalNetSalaryDue,
    payrollPeriodStatus: thisMonthPeriod?.status ?? "DRAFT",
  });
}

export async function getRecentActivities() {
  const data = await prisma.employeeTransaction.findMany({
    include: { employee: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return serialize(data);
}
