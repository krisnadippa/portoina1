"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { generateTransactionId, serialize } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { recalculateEmployeePayroll } from "./payroll";

export async function getTransactions(filters?: {
  employeeId?: string;
  type?: string;
  status?: string;
  effect?: string;
  payrollPeriodId?: string;
  month?: number;
  year?: number;
}) {
  const where: Prisma.EmployeeTransactionWhereInput = {};

  if (filters?.employeeId) where.employeeId = filters.employeeId;
  if (filters?.type) where.type = filters.type;
  if (filters?.status) where.status = filters.status;
  if (filters?.effect) where.effect = filters.effect;
  if (filters?.payrollPeriodId) where.payrollPeriodId = filters.payrollPeriodId;

  if (filters?.month && filters?.year) {
    where.date = {
      gte: new Date(filters.year, filters.month - 1, 1),
      lt: new Date(filters.year, filters.month, 1),
    };
  }

  const data = await prisma.employeeTransaction.findMany({
    where,
    include: {
      employee: true,
      createdBy: { select: { name: true, email: true } },
      payrollPeriod: true,
    },
    orderBy: { date: "desc" },
  });
  return serialize(data);
}

export async function createTransaction(data: {
  employeeId: string;
  type: string;
  effect: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod?: string;
  status?: string;
  payrollPeriodId?: string;
  category?: string;
  createdById: string;
}) {
  try {
    const prefix = data.type.substring(0, 3).toUpperCase();
    const transactionId = generateTransactionId(prefix);
    const txDate = new Date(data.date);
    const txMonth = txDate.getMonth() + 1;
    const txYear = txDate.getFullYear();

    // Auto find or create payroll period for the transaction's month/year
    let periodId = data.payrollPeriodId;
    if (!periodId) {
      const period = await prisma.payrollPeriod.upsert({
        where: { month_year: { month: txMonth, year: txYear } },
        update: {},
        create: {
          month: txMonth,
          year: txYear,
          status: "DRAFT",
        },
      });
      periodId = period.id;
    }

    const transaction = await prisma.employeeTransaction.create({
      data: {
        transactionId,
        employeeId: data.employeeId,
        type: data.type,
        effect: data.effect,
        amount: new Prisma.Decimal(data.amount),
        date: txDate,
        description: data.description,
        paymentMethod: data.paymentMethod,
        status: data.status ?? "DISETUJUI",
        payrollPeriodId: periodId,
        category: data.category,
        createdById: data.createdById,
      },
      include: { employee: true },
    });

    // Automatically recalculate employee payroll so deductions/additions apply immediately!
    await recalculateEmployeePayroll(data.employeeId, periodId);

    revalidatePath("/transaksi/bon");
    revalidatePath("/transaksi/topup");
    revalidatePath("/transaksi/tarik-tunai");
    revalidatePath("/transaksi/potongan");
    revalidatePath("/penggajian");
    revalidatePath("/slip-gaji");
    revalidatePath("/laporan");
    revalidatePath("/");

    return { success: true, data: serialize(transaction) };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { success: false, error: "Gagal membuat transaksi" };
  }
}

export async function updateTransactionStatus(
  id: string,
  status: string,
  payrollPeriodId?: string
) {
  try {
    const transaction = await prisma.employeeTransaction.update({
      where: { id },
      data: { status, payrollPeriodId },
    });

    if (transaction.payrollPeriodId) {
      await recalculateEmployeePayroll(transaction.employeeId, transaction.payrollPeriodId);
    }

    revalidatePath("/transaksi/bon");
    revalidatePath("/transaksi/topup");
    revalidatePath("/transaksi/tarik-tunai");
    revalidatePath("/transaksi/potongan");
    revalidatePath("/penggajian");
    revalidatePath("/slip-gaji");

    return { success: true, data: serialize(transaction) };
  } catch {
    return { success: false, error: "Gagal mengupdate transaksi" };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const transaction = await prisma.employeeTransaction.findUnique({
      where: { id },
      include: { payrollPeriod: true },
    });

    if (transaction?.payrollPeriod?.status === "DIBAYAR") {
      return {
        success: false,
        error: "Transaksi tidak dapat dihapus. Periode penggajian sudah terkunci dan dibayarkan.",
      };
    }

    if (!transaction) return { success: false, error: "Transaksi tidak ditemukan" };

    const { employeeId, payrollPeriodId } = transaction;

    await prisma.employeeTransaction.delete({ where: { id } });

    if (payrollPeriodId) {
      await recalculateEmployeePayroll(employeeId, payrollPeriodId);
    }

    revalidatePath("/transaksi/bon");
    revalidatePath("/transaksi/topup");
    revalidatePath("/transaksi/tarik-tunai");
    revalidatePath("/transaksi/potongan");
    revalidatePath("/penggajian");
    revalidatePath("/slip-gaji");
    revalidatePath("/laporan");
    revalidatePath("/");

    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus transaksi" };
  }
}

export async function getDefaultAdmin() {
  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });
  return serialize(admin);
}
