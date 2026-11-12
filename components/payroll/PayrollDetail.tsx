"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Lock,
  FileText,
  Download,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DialogModal } from "@/components/ui/DialogModal";
import {
  formatCurrency,
  formatPeriod,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import { processPayroll, lockPayroll, markPayrollAsPaid } from "@/lib/actions/payroll";
import { useRouter } from "next/navigation";

interface PayrollPeriodData {
  id: string;
  month: number;
  year: number;
  status: string;
  lockedAt?: Date | null;
  processedAt?: Date | null;
  paidAt?: Date | null;
  details: Array<{
    id: string;
    employeeId: string;
    employee: {
      id: string;
      employeeId: string;
      name: string;
      position: string;
      department: string;
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
    payslip?: { id: string } | null;
  }>;
  transactions: Array<{
    id: string;
    type: string;
    amount: unknown;
    description: string;
    employee: { name: string } | null;
  }>;
}

export function PayrollDetail({ period }: { period: PayrollPeriodData }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "success" | "confirm" | "danger" | "info";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const totalGross = period.details.reduce((sum, d) => sum + Number(d.grossSalary), 0);
  const totalDeductions = period.details.reduce((sum, d) => sum + Number(d.totalDeductions), 0);
  const totalNet = period.details.reduce((sum, d) => sum + Number(d.netSalary), 0);

  const executeProcess = async () => {
    setLoading(true);
    setDialog((prev) => ({ ...prev, isOpen: false }));
    try {
      const res = await processPayroll(period.id);
      if (res.success) {
        setDialog({
          isOpen: true,
          title: "Berhasil Diproses",
          message: "Seluruh komponen gaji, kasbon, dan potongan karyawan telah berhasil dihitung.",
          type: "success",
        });
        router.refresh();
      } else {
        setDialog({
          isOpen: true,
          title: "Gagal Memproses",
          message: res.error || "Terjadi kesalahan saat memproses penggajian.",
          type: "danger",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = () => {
    setDialog({
      isOpen: true,
      title: "Hitung & Proses Penggajian?",
      message: "Sistem akan otomatis menghitung ulang seluruh gaji pokok, kasbon, dan potongan periode ini.",
      type: "confirm",
      onConfirm: executeProcess,
    });
  };

  const executeLock = async () => {
    setLoading(true);
    setDialog((prev) => ({ ...prev, isOpen: false }));
    try {
      const res = await lockPayroll(period.id);
      if (res.success) {
        setDialog({
          isOpen: true,
          title: "Penggajian Dikunci",
          message: "Periode penggajian berhasil dikunci dan slip gaji resmi telah diterbitkan.",
          type: "success",
        });
        router.refresh();
      } else {
        setDialog({
          isOpen: true,
          title: "Gagal Mengunci",
          message: res.error || "Gagal mengunci periode penggajian.",
          type: "danger",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLock = () => {
    setDialog({
      isOpen: true,
      title: "Kunci Periode Penggajian?",
      message: "Setelah dikunci, slip gaji akan diterbitkan dan transaksi terkait tidak dapat diubah tanpa prosedur koreksi.",
      type: "confirm",
      onConfirm: executeLock,
    });
  };

  const executeMarkPaid = async () => {
    setLoading(true);
    setDialog((prev) => ({ ...prev, isOpen: false }));
    try {
      const res = await markPayrollAsPaid(period.id);
      if (res.success) {
        setDialog({
          isOpen: true,
          title: "Gaji Ditandai Lunas",
          message: "Seluruh gaji telah ditandai sudah dibayar, dan status kasbon karyawan terkait otomatis diperbarui menjadi LUNAS.",
          type: "success",
        });
        router.refresh();
      } else {
        setDialog({
          isOpen: true,
          title: "Gagal",
          message: res.error || "Gagal menandai gaji sebagai dibayar.",
          type: "danger",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = () => {
    setDialog({
      isOpen: true,
      title: "Tandai Sudah Dibayar?",
      message: "Seluruh gaji periode ini akan ditandai SUDAH DIBAYAR dan kasbon karyawan yang terpotong otomatis menjadi LUNAS.",
      type: "confirm",
      onConfirm: executeMarkPaid,
    });
  };

  const exportToCSV = () => {
    const headers = [
      "ID Karyawan",
      "Nama Karyawan",
      "Jabatan",
      "Departemen",
      "Gaji Pokok",
      "Tunjangan",
      "Bonus/Insentif",
      "Lembur",
      "Gaji Kotor",
      "Total Bon",
      "Total Potongan",
      "Gaji Bersih",
      "Status",
    ];

    const rows = period.details.map((d) => [
      `"${d.employee.employeeId}"`,
      `"${d.employee.name}"`,
      `"${d.employee.position}"`,
      `"${d.employee.department}"`,
      Number(d.baseSalary),
      Number(d.fixedAllowance),
      Number(d.bonus) + Number(d.incentive),
      Number(d.overtime),
      Number(d.grossSalary),
      Number(d.bon),
      Number(d.totalDeductions),
      Number(d.netSalary),
      `"${d.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Penggajian_${period.year}_${String(period.month).padStart(2, "0")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/penggajian"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-1"
          >
            <ArrowLeft size={16} />
            Kembali ke Daftar Penggajian
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#0F172A]">
              Periode {formatPeriod(period.month, period.year)}
            </h1>
            <Badge
              label={getStatusLabel(period.status)}
              className={getStatusColor(period.status)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={15} />}
            onClick={exportToCSV}
            disabled={period.details.length === 0}
          >
            Export CSV
          </Button>

          {period.status !== "DIBAYAR" && (
            <Button
              variant="outline"
              size="sm"
              icon={<Play size={15} />}
              loading={loading}
              onClick={handleProcess}
            >
              {period.status === "DRAFT" ? "Hitung & Proses Gaji" : "Kalkulasi Ulang"}
            </Button>
          )}

          {period.status === "DIPROSES" && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Lock size={15} />}
              loading={loading}
              onClick={handleLock}
            >
              Kunci Periode
            </Button>
          )}

          {period.status === "MENUNGGU_PEMBAYARAN" && (
            <Button
              size="sm"
              icon={<Check size={15} />}
              loading={loading}
              onClick={handleMarkPaid}
              className="bg-green-600 hover:bg-green-700"
            >
              Tandai Sudah Dibayar
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0]">
          <p className="text-xs font-medium text-slate-500">Total Karyawan</p>
          <p className="text-2xl font-bold text-[#0F172A] mt-1">{period.details.length}</p>
          <p className="text-xs text-slate-400 mt-1">Karyawan masuk perhitungan</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0]">
          <p className="text-xs font-medium text-slate-500">Total Gaji Kotor</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(totalGross)}</p>
          <p className="text-xs text-slate-400 mt-1">Gaji pokok + tunjangan + insentif</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0]">
          <p className="text-xs font-medium text-slate-500">Total Seluruh Potongan</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalDeductions)}</p>
          <p className="text-xs text-slate-400 mt-1">Bon + uang muka + potongan lain</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0]">
          <p className="text-xs font-medium text-slate-500">Total Gaji Bersih Dibayar</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalNet)}</p>
          <p className="text-xs text-slate-400 mt-1">Gaji kotor - total potongan</p>
        </div>
      </div>

      {period.status === "DRAFT" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">Periode masih berupa Draft</p>
            <p className="text-amber-700 mt-0.5">
              Klik tombol <strong>Hitung &amp; Proses Gaji</strong> di atas untuk memproses data gaji pokok seluruh karyawan aktif beserta transaksi bon dan potongan yang terkait periode ini.
            </p>
          </div>
        </div>
      )}

      {/* Detail Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0F172A]">
            Rincian Penggajian Karyawan
          </h2>
          <span className="text-xs text-slate-500">
            {period.details.length} Data Karyawan
          </span>
        </div>

        {period.details.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500">Belum ada kalkulasi gaji untuk periode ini.</p>
            <Button
              size="sm"
              icon={<Play size={14} />}
              className="mt-3"
              onClick={handleProcess}
              loading={loading}
            >
              Proses Sekarang
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Karyawan</th>
                  <th className="px-4 py-3 text-right">Gaji Pokok</th>
                  <th className="px-4 py-3 text-right">Tunjangan</th>
                  <th className="px-4 py-3 text-right">Bonus/Lembur</th>
                  <th className="px-4 py-3 text-right">Gaji Kotor</th>
                  <th className="px-4 py-3 text-right">Bon / Kasbon</th>
                  <th className="px-4 py-3 text-right">Potongan Lain</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-800">Gaji Bersih</th>
                  <th className="px-4 py-3 text-center">Slip Gaji</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {period.details.map((detail) => (
                  <tr key={detail.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-[#0F172A]">{detail.employee.name}</p>
                        <p className="text-xs text-slate-500">
                          {detail.employee.employeeId} · {detail.employee.position}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                      {formatCurrency(Number(detail.baseSalary))}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                      {formatCurrency(Number(detail.fixedAllowance))}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-green-600">
                      +{formatCurrency(
                        Number(detail.bonus) +
                          Number(detail.incentive) +
                          Number(detail.overtime) +
                          Number(detail.otherIncome)
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-medium text-slate-900 bg-slate-50/40">
                      {formatCurrency(Number(detail.grossSalary))}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-orange-600">
                      -{formatCurrency(Number(detail.bon))}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-red-600">
                      -{formatCurrency(Number(detail.salaryAdvance) + Number(detail.otherDeductions))}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-blue-700 bg-blue-50/30">
                      {formatCurrency(Number(detail.netSalary))}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Link href={`/slip-gaji?detailId=${detail.id}`}>
                        <button
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Lihat Slip Gaji"
                        >
                          <FileText size={13} />
                          Slip
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DialogModal
        isOpen={dialog.isOpen}
        onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        loading={loading}
      />
    </div>
  );
}

