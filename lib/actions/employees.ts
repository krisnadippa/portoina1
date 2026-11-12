"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { generateEmployeeId, serialize } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export async function getEmployees() {
  const data = await prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
  });
  return serialize(data);
}

export async function getEmployee(id: string) {
  const data = await prisma.employee.findUnique({
    where: { id },
    include: {
      transactions: {
        include: { employee: true },
        orderBy: { date: "desc" },
        take: 20,
      },
      payrollDetails: {
        include: { payrollPeriod: true },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });
  return serialize(data);
}

export async function createEmployee(data: {
  name: string;
  position: string;
  department: string;
  phone: string;
  address: string;
  joinDate: string;
  baseSalary: number;
  fixedAllowance?: number;
  notes?: string;
}) {
  try {
    const count = await prisma.employee.count();
    const employeeId = generateEmployeeId(count + 1);

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        name: data.name,
        position: data.position,
        department: data.department,
        phone: data.phone,
        address: data.address,
        joinDate: new Date(data.joinDate),
        baseSalary: new Prisma.Decimal(data.baseSalary),
        fixedAllowance: new Prisma.Decimal(data.fixedAllowance ?? 0),
        notes: data.notes,
        status: "AKTIF",
      },
    });

    revalidatePath("/karyawan");
    return { success: true, data: employee };
  } catch (error) {
    console.error("Error creating employee:", error);
    return { success: false, error: "Gagal membuat karyawan" };
  }
}

export async function updateEmployee(
  id: string,
  data: {
    name?: string;
    position?: string;
    department?: string;
    phone?: string;
    address?: string;
    joinDate?: string;
    baseSalary?: number;
    fixedAllowance?: number;
    status?: string;
    notes?: string;
  }
) {
  try {
    const updateData: Prisma.EmployeeUpdateInput = {
      ...data,
      joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
      baseSalary: data.baseSalary !== undefined
        ? new Prisma.Decimal(data.baseSalary)
        : undefined,
      fixedAllowance: data.fixedAllowance !== undefined
        ? new Prisma.Decimal(data.fixedAllowance)
        : undefined,
    };

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/karyawan");
    revalidatePath(`/karyawan/${id}`);
    return { success: true, data: employee };
  } catch (error) {
    console.error("Error updating employee:", error);
    return { success: false, error: "Gagal mengupdate karyawan" };
  }
}

export async function deleteEmployee(id: string) {
  try {
    await prisma.employee.delete({ where: { id } });
    revalidatePath("/karyawan");
    return { success: true };
  } catch (error) {
    console.error("Error deleting employee:", error);
    return { success: false, error: "Gagal menghapus karyawan" };
  }
}

export async function toggleEmployeeStatus(id: string, currentStatus: string) {
  const newStatus = currentStatus === "AKTIF" ? "NONAKTIF" : "AKTIF";
  return updateEmployee(id, { status: newStatus });
}

export async function getEmployeeStats(id: string) {
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) return null;

  const thisMonthTransactions = await prisma.employeeTransaction.findMany({
    where: {
      employeeId: id,
      date: {
        gte: new Date(thisYear, thisMonth - 1, 1),
        lt: new Date(thisYear, thisMonth, 1),
      },
      status: "DISETUJUI",
    },
  });

  const unpaidBon = await prisma.employeeTransaction.aggregate({
    where: {
      employeeId: id,
      type: "BON",
      status: { notIn: ["LUNAS"] },
      effect: "PENGURANG_GAJI",
    },
    _sum: { amount: true },
  });

  const thisMonthDeductions = thisMonthTransactions
    .filter((t) => t.effect === "PENGURANG_GAJI")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const thisMonthAdditions = thisMonthTransactions
    .filter((t) => t.effect === "PENAMBAH_GAJI")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const grossSalary =
    Number(employee.baseSalary) +
    Number(employee.fixedAllowance) +
    thisMonthAdditions;
  const netSalary = grossSalary - thisMonthDeductions;

  return serialize({
    employee,
    unpaidBon: Number(unpaidBon._sum.amount ?? 0),
    thisMonthDeductions,
    thisMonthAdditions,
    grossSalary,
    netSalary,
    thisMonthTransactions,
  });
}

