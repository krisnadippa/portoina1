"use client";

import { useState } from "react";
import {
  Download,
  Printer,
  Search,
  Filter,
  TrendingDown,
  TrendingUp,
  Wallet,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import {
  formatCurrency,
  formatDateShort,
  getMonthName,
  getTransactionTypeLabel,
  getStatusLabel,
  getStatusColor,
} from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

interface ReportProps {
  data: {
    transactions: Array<{
      id: string;
      transactionId: string;
      type: string;
      effect: string;
      amount: unknown;
      date: Date;
      description: string;
      status: string;
      employee: { name: string; employeeId: string; department: string } | null;
    }>;
    employees: Array<{ id: string; name: string; employeeId: string }>;
    monthlySummary: Array<{
      month: number;
      year: number;
      grossSalary: number;
      deductions: number;
      netSalary: number;
      employeeCount: number;
    }>;
    totals: {
      totalBon: number;
      totalSalaryAdvance: number;
      totalBonusIncentive: number;
      totalOtherDeductions: number;
      totalDisbursed: number;
    };
  };
}

export function FinancialReport({ data }: ReportProps) {
  const { transactions, employees, monthlySummary, totals } = data;

  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filteredTransactions = transactions.filter((t) => {
    const matchSearch =
      (t.employee?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      t.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());

    const tDate = new Date(t.date);
    const matchMonth =
      selectedMonth === "ALL" || tDate.getMonth() + 1 === Number(selectedMonth);
    const matchYear =
      selectedYear === "ALL" || tDate.getFullYear() === Number(selectedYear);
    const matchEmp =
      selectedEmployee === "ALL" || t.employee?.employeeId === selectedEmployee;
    const matchType = selectedType === "ALL" || t.type === selectedType;

    return matchSearch && matchMonth && matchYear && matchEmp && matchType;
  });

  const chartData = monthlySummary.map((item) => ({
    name: getMonthName(item.month).slice(0, 3),
    GajiKotor: item.grossSalary,
    Potongan: item.deductions,
    GajiBersih: item.netSalary,
  }));

  const exportCSV = () => {
    const headers = [
      "ID Transaksi",
      "Karyawan",
      "Departemen",
      "Tipe",
      "Keterangan",
      "Tanggal",
      "Nominal",
      "Status",
    ];
    const rows = filteredTransactions.map((t) => [
      `"${t.transactionId}"`,
      `"${t.employee?.name || "-"}"`,
      `"${t.employee?.department || "-"}"`,
      `"${getTransactionTypeLabel(t.type)}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${formatDateShort(t.date)}"`,
      Number(t.amount),
      `"${t.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Keuangan_Payroll_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-[#0F172A]">Laporan Keuangan &amp; Payroll</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Analisis menyeluruh pengeluaran gaji, bon karyawan, dan riwayat transaksi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Printer size={15} />}
            onClick={() => window.print()}
          >
            Cetak Laporan
          </Button>
          <Button
            size="sm"
            icon={<Download size={15} />}
            onClick={exportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Kasbon Karyawan"
          value={formatCurrency(totals.totalBon)}
          subtitle="Total bon tercatat"
          icon={<TrendingDown size={20} />}
          accentColor="bg-orange-50 text-orange-600"
        />
        <StatCard
          title="Uang Muka Gaji"
          value={formatCurrency(totals.totalSalaryAdvance)}
          subtitle="Top up &amp; Tarik tunai gajian"
          icon={<Wallet size={20} />}
          accentColor="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Total Bonus &amp; Insentif"
          value={formatCurrency(totals.totalBonusIncentive)}
          subtitle="Bonus, insentif &amp; lembur"
          icon={<TrendingUp size={20} />}
          accentColor="bg-green-50 text-green-600"
        />
        <StatCard
          title="Total Potongan Khusus"
          value={formatCurrency(totals.totalOtherDeductions)}
          subtitle="Denda, pinjaman, absensi"
          icon={<DollarSign size={20} />}
          accentColor="bg-red-50 text-red-600"
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Grafik Pengeluaran Gaji Bulanan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tren komparasi Gaji Kotor, Total Potongan, dan Gaji Bersih yang Dibayarkan
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="25%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                />
                <Tooltip
                  formatter={(val: unknown) => [formatCurrency(Number(val) || 0), ""]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar dataKey="GajiKotor" name="Gaji Kotor" fill="#93C5FD" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Potongan" name="Potongan" fill="#FCA5A5" radius={[3, 3, 0, 0]} />
                <Bar dataKey="GajiBersih" name="Gaji Bersih" fill="#2563EB" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Belum ada data penggajian untuk digrafikkan
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-3">
        <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Filter size={14} /> Filter Laporan &amp; Transaksi
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-white outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-white outline-none focus:border-blue-500 cursor-pointer"
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
            className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-white outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Semua Tahun</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>

          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-white outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Semua Karyawan</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.employeeId}>
                {emp.name} ({emp.employeeId})
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-white outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="BON">Bon / Kasbon</option>
            <option value="TOP_UP">Top Up Dana</option>
            <option value="TARIK_TUNAI">Tarik Tunai</option>
            <option value="POTONGAN">Potongan Khusus</option>
            <option value="BONUS">Bonus</option>
            <option value="INSENTIF">Insentif</option>
            <option value="LEMBUR">Lembur</option>
          </select>
        </div>
      </div>

      {/* Transaction Details Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0F172A]">
            Tabel Rincian Transaksi Terkait
          </h2>
          <span className="text-xs text-slate-500">
            {filteredTransactions.length} Transaksi Ditemukan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">ID Transaksi</th>
                <th className="px-4 py-3">Karyawan</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3 text-right">Nominal</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Tidak ada transaksi yang cocok dengan filter yang dipilih
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-slate-600">{t.transactionId}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {t.employee?.name || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {getTransactionTypeLabel(t.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{t.description}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDateShort(t.date)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(Number(t.amount))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge label={getStatusLabel(t.status)} className={getStatusColor(t.status)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
