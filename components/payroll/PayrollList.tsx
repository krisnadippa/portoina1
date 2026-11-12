"use client";

import { useState } from "react";
import {
  Plus,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Circle,
  ChevronRight,
} from "lucide-react";
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
import Link from "next/link";
import { createOrGetPayrollPeriod } from "@/lib/actions/payroll";
import { useRouter } from "next/navigation";

interface Period {
  id: string;
  month: number;
  year: number;
  status: string;
  processedAt?: Date | null;
  paidAt?: Date | null;
  details: Array<{
    id: string;
    grossSalary: unknown;
    netSalary: unknown;
    status: string;
  }>;
}

export function PayrollList({ periods }: { periods: Period[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const handleCreatePeriod = async () => {
    setLoading(true);
    try {
      const period = await createOrGetPayrollPeriod(currentMonth, currentYear);
      router.push(`/penggajian/${period.id}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DRAFT": return <Circle size={16} className="text-slate-400" />;
      case "DIPROSES": return <Clock size={16} className="text-blue-500" />;
      case "MENUNGGU_PEMBAYARAN": return <AlertCircle size={16} className="text-yellow-500" />;
      case "DIBAYAR": return <CheckCircle size={16} className="text-green-500" />;
      default: return <Circle size={16} className="text-slate-400" />;
    }
  };

  const currentPeriodExists = periods.some(
    (p) => p.month === currentMonth && p.year === currentYear
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#0F172A]">
            Penggajian
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola dan proses penggajian karyawan setiap bulan
          </p>
        </div>
        {!currentPeriodExists && (
          <Button
            icon={<Plus size={16} />}
            loading={loading}
            onClick={handleCreatePeriod}
          >
            Buat Penggajian {getMonthName(currentMonth)} {currentYear}
          </Button>
        )}
      </div>

      {/* Periods */}
      {periods.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0]">
          <EmptyState
            icon={<CreditCard size={32} />}
            title="Belum ada penggajian"
            description="Buat penggajian untuk bulan ini untuk mulai mengelola gaji karyawan"
            action={
              <Button
                icon={<Plus size={16} />}
                loading={loading}
                onClick={handleCreatePeriod}
              >
                Buat Penggajian Sekarang
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {periods.map((period) => {
            const totalGross = period.details.reduce(
              (sum, d) => sum + Number(d.grossSalary),
              0
            );
            const totalNet = period.details.reduce(
              (sum, d) => sum + Number(d.netSalary),
              0
            );

            return (
              <Link key={period.id} href={`/penggajian/${period.id}`}>
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-sm hover:border-blue-200 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0">
                      {getStatusIcon(period.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#0F172A]">
                          {formatPeriod(period.month, period.year)}
                        </h3>
                        <Badge
                          label={getStatusLabel(period.status)}
                          className={getStatusColor(period.status)}
                        />
                        {period.month === currentMonth &&
                          period.year === currentYear && (
                            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                              Bulan Ini
                            </span>
                          )}
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <span className="text-xs text-slate-500">
                          {period.details.length} karyawan
                        </span>
                        {period.details.length > 0 && (
                          <>
                            <span className="text-xs text-slate-500">
                              Kotor:{" "}
                              <span className="font-medium text-slate-700">
                                {formatCurrency(totalGross)}
                              </span>
                            </span>
                            <span className="text-xs text-slate-500">
                              Bersih:{" "}
                              <span className="font-medium text-green-600">
                                {formatCurrency(totalNet)}
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-slate-400 group-hover:text-slate-600 shrink-0 transition-colors"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

