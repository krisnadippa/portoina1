"use client";

import { useState } from "react";
import { Search, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  formatCurrency,
  formatPeriod,
  getStatusColor,
  getStatusLabel,
  getMonthName,
} from "@/lib/utils";
import { PayslipView } from "./PayslipView";

interface PayslipItem {
  id: string;
  employee: {
    id: string;
    employeeId: string;
    name: string;
    position: string;
    department: string;
  };
  payrollPeriod: {
    month: number;
    year: number;
    status: string;
    paidAt?: Date | null;
  };
  baseSalary: unknown;
  fixedAllowance: unknown;
  bonus: unknown;
  incentive: unknown;
  overtime: unknown;
  otherIncome: unknown;
  grossSalary: unknown;
  bon: unknown;
  salaryAdvance: unknown;
  otherDeductions: unknown;
  totalDeductions: unknown;
  netSalary: unknown;
  status: string;
}

export function PayslipList({
  payslips,
  company,
  selectedDetailId,
}: {
  payslips: PayslipItem[];
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  selectedDetailId?: string;
}) {
  const [search, setSearch] = useState("");
  const [activeModalItem, setActiveModalItem] = useState<PayslipItem | null>(() => {
    if (selectedDetailId) {
      return payslips.find((p) => p.id === selectedDetailId) || null;
    }
    return null;
  });

  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");

  const availableYears = Array.from(
    new Set(payslips.map((p) => p.payrollPeriod.year))
  ).sort((a, b) => b - a);

  const filtered = payslips.filter((p) => {
    const matchSearch =
      p.employee.name.toLowerCase().includes(search.toLowerCase()) ||
      p.employee.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      p.employee.department.toLowerCase().includes(search.toLowerCase());

    const matchMonth =
      selectedMonth === "ALL" || p.payrollPeriod.month === Number(selectedMonth);
    const matchYear =
      selectedYear === "ALL" || p.payrollPeriod.year === Number(selectedYear);

    return matchSearch && matchMonth && matchYear;
  });

  return (
    <div className="space-y-6">
      {/* View Modal if selected */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl my-8">
            <PayslipView
              data={{ detail: activeModalItem, company }}
              onClose={() => setActiveModalItem(null)}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-base font-semibold text-[#0F172A]">Slip Gaji Karyawan</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Cetak atau unduh slip gaji resmi untuk setiap periode penggajian
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari nama karyawan, ID, departemen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-colors"
          />
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="ALL">Semua Bulan</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {getMonthName(m)}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="ALL">Semua Tahun</option>
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* List / Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText size={32} />}
            title="Tidak ada slip gaji ditemukan"
            description="Slip gaji akan otomatis tersedia setelah periode penggajian diproses atau dikunci."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Karyawan</th>
                  <th className="px-4 py-3">Periode</th>
                  <th className="px-4 py-3 text-right">Penghasilan Kotor</th>
                  <th className="px-4 py-3 text-right">Potongan</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-800">Gaji Bersih</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-blue-700">
                            {item.employee.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[#0F172A]">{item.employee.name}</p>
                          <p className="text-xs text-slate-500">
                            {item.employee.employeeId} · {item.employee.position}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-slate-700">
                        {formatPeriod(item.payrollPeriod.month, item.payrollPeriod.year)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                      {formatCurrency(Number(item.grossSalary))}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-red-600">
                      -{formatCurrency(Number(item.totalDeductions))}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-blue-700 bg-blue-50/20">
                      {formatCurrency(Number(item.netSalary))}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        label={getStatusLabel(item.status)}
                        className={getStatusColor(item.status)}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Eye size={13} />}
                        onClick={() => setActiveModalItem(item)}
                      >
                        Lihat Slip
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

