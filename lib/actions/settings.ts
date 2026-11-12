"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";

export async function getSettingsData() {
  const [settings, users] = await Promise.all([
    prisma.companySetting.findMany(),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return serialize({
    company: {
      name: settingsMap["company_name"] || "PT. Maju Bersama Indonesia",
      address: settingsMap["company_address"] || "Jl. Sudirman No. 123, Jakarta Pusat 10220",
      phone: settingsMap["company_phone"] || "+62 21 1234 5678",
      email: settingsMap["company_email"] || "info@majubersama.id",
      logo: settingsMap["company_logo"] || "",
    },
    payroll: {
      payrollDate: settingsMap["payroll_date"] || "25",
      currency: settingsMap["currency"] || "IDR",
      bonAllocationRule: settingsMap["bon_allocation_rule"] || "AUTO_DEDUCT",
      maxBonPercentage: settingsMap["max_bon_percentage"] || "50",
    },
    users,
  });
}

export async function updateCompanySettings(data: {
  name: string;
  address: string;
  phone: string;
  email: string;
}) {
  try {
    const entries = [
      { key: "company_name", value: data.name },
      { key: "company_address", value: data.address },
      { key: "company_phone", value: data.phone },
      { key: "company_email", value: data.email },
    ];

    for (const item of entries) {
      await prisma.companySetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    revalidatePath("/pengaturan");
    revalidatePath("/slip-gaji");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal memperbarui profil perusahaan" };
  }
}

export async function updatePayrollSettings(data: {
  payrollDate: string;
  bonAllocationRule: string;
  maxBonPercentage: string;
}) {
  try {
    const entries = [
      { key: "payroll_date", value: data.payrollDate },
      { key: "bon_allocation_rule", value: data.bonAllocationRule },
      { key: "max_bon_percentage", value: data.maxBonPercentage },
    ];

    for (const item of entries) {
      await prisma.companySetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    revalidatePath("/pengaturan");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal memperbarui pengaturan penggajian" };
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  password?: string;
  role: string;
}) {
  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return { success: false, error: "Email sudah terdaftar" };
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password || "password123",
        role: data.role,
        isActive: true,
      },
    });

    revalidatePath("/pengaturan");
    return { success: true, user };
  } catch {
    return { success: false, error: "Gagal menambahkan pengguna" };
  }
}

