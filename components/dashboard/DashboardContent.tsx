"use client";

import {
  Users,
  DollarSign,
  CreditCard,
  ArrowUpDown,
  TrendingDown,
  Wallet,
  Plus,
  ArrowRight,
  UserPlus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Circle,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency, getTransactionTypeLabel, getStatusColor, getStatusLabel, formatDateShort } from "@/lib/utils";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DashboardContentProps {
  stats: {
    totalActiveEmployees: number;
    totalMonthlySalary: number;
    totalBon: number;
    totalFundsDisbursed: number;
    totalDeductionsThisMonth: number;
    totalNetSalaryDue: number;
    payrollPeriodStatus: string;
  };
  activities: Array<{
    id: string;
    type: string;
    amount: unknown;
    date: Date;
    status: string;
    employee: { name: string; position: string } | null;
    description: string;
  }>;
}

// Sample chart data - in real app, fetch from API
const chartData = [
  { bulan: "Jun", kotor: 45000000, bersih: 41000000 },
  { bulan: "Jul", kotor: 47000000, bersih: 43000000 },
  { bulan: "Agu", kotor: 48000000, bersih: 44000000 },
  { bulan: "Sep", kotor: 46000000, bersih: 42000000 },
  { bulan: "Okt", kotor: 50000000, bersih: 46000000 },
  { bulan: "Nov", kotor: 52000000, bersih: 47000000 },
];

const payrollStatusItems = [
  { label: "Belum Diproses", count: 0, icon: Circle, color: "text-slate-400" },
  { label: "Sedang Diproses", count: 0, icon: Clock, color: "text-blue-500" },
  { label: "Menunggu Pembayaran", count: 0, icon: AlertCircle, color: "text-yellow-500" },
  { label: "Sudah Dibayarkan", count: 0, icon: CheckCircle, color: "text-green-500" },
];

function formatAmount(amount: unknown): number {
  return Number(amount) ?? 0;
}

export function DashboardContent({ stats, activities }: DashboardContentProps) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          title="Total Karyawan Aktif"
          value={stats.totalActiveEmployees.toString()}
          subtitle="Karyawan terdaftar"
          icon={<Users size={20} />}
          accentColor="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Total Gaji Bulanan"
          value={formatCurrency(stats.totalMonthlySalary)}
          subtitle="Gaji pokok + tunjangan"
          icon={<DollarSign size={20} />}
          accentColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Total Bon Bulan Ini"
          value={formatCurrency(stats.totalBon)}
          subtitle="Bon yang belum lunas"
          icon={<CreditCard size={20} />}
          accentColor="bg-orange-50 text-orange-600"
        />
        <StatCard
          title="Total Dana Dikeluarkan"
          value={formatCurrency(stats.totalFundsDisbursed)}
          subtitle="Semua transaksi bulan ini"
          icon={<ArrowUpDown size={20} />}
          accentColor="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Total Potongan Bulan Ini"
          value={formatCurrency(stats.totalDeductionsThisMonth)}
          subtitle="Semua pengurang gaji"
          icon={<TrendingDown size={20} />}
          accentColor="bg-red-50 text-red-600"
        />
        <StatCard
          title="Estimasi Gaji Bersih"
          value={formatCurrency(stats.totalNetSalaryDue)}
          subtitle="Yang harus dibayarkan"
          icon={<Wallet size={20} />}
          accentColor="bg-slate-100 text-slate-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-[#0F172A]">
                Ringkasan Penggajian
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbandingan gaji kotor vs bersih 6 bulan terakhir
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
              barCategoryGap="30%"
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="bulan"
                tick={{ fontSize: 12, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
              />
              <Tooltip
                formatter={(value: unknown) => [formatCurrency(Number(value) || 0), ""]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="kotor"
                name="Gaji Kotor"
                fill="#BFDBFE"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="bersih"
                name="Gaji Bersih"
                fill="#2563EB"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#BFDBFE]" />
              <span className="text-xs text-slate-500">Gaji Kotor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-xs text-slate-500">Gaji Bersih</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Payroll Status */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">
              Status Penggajian
            </h2>
            <div className="space-y-3">
              {payrollStatusItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3"
                  >
                    <Icon size={16} className={item.color} />
                    <span className="text-sm text-slate-700 flex-1">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-[#0F172A]">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Status bulan ini</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(stats.payrollPeriodStatus)}`}>
                  {getStatusLabel(stats.payrollPeriodStatus)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">
              Aksi Cepat
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/karyawan?action=add">
                <button className="w-full flex flex-col items-center gap-1.5 p-3 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 hover:border-blue-200 transition-colors">
                  <UserPlus size={18} className="text-blue-600" />
                  <span className="text-xs text-slate-600 font-medium text-center leading-tight">
                    Tambah Karyawan
                  </span>
                </button>
              </Link>
              <Link href="/transaksi/bon?action=add">
                <button className="w-full flex flex-col items-center gap-1.5 p-3 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 hover:border-blue-200 transition-colors">
                  <Plus size={18} className="text-blue-600" />
                  <span className="text-xs text-slate-600 font-medium text-center leading-tight">
                    Tambah Transaksi
                  </span>
                </button>
              </Link>
              <Link href="/penggajian?action=process">
                <button className="w-full flex flex-col items-center gap-1.5 p-3 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 hover:border-blue-200 transition-colors">
                  <DollarSign size={18} className="text-blue-600" />
                  <span className="text-xs text-slate-600 font-medium text-center leading-tight">
                    Buat Penggajian
                  </span>
                </button>
              </Link>
              <Link href="/slip-gaji">
                <button className="w-full flex flex-col items-center gap-1.5 p-3 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 hover:border-blue-200 transition-colors">
                  <FileText size={18} className="text-blue-600" />
                  <span className="text-xs text-slate-600 font-medium text-center leading-tight">
                    Lihat Slip Gaji
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl border border-[#E2E8F0]">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Aktivitas Terbaru
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transaksi dan perubahan data terkini
            </p>
          </div>
          <Link href="/transaksi/bon">
            <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight size={12} />
            </button>
          </Link>
        </div>

        {activities.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400">Belum ada aktivitas</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[#0F172A] truncate">
                      {activity.employee?.name ?? "—"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      {getTransactionTypeLabel(activity.type)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {activity.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-[#0F172A]">
                    {formatCurrency(formatAmount(activity.amount))}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDateShort(activity.date)}
                  </p>
                </div>
                <div className="shrink-0">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(activity.status)}`}
                  >
                    {getStatusLabel(activity.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

