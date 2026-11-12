"use client";

import {
  ArrowLeft,
  Edit2,
  UserX,
  UserCheck,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { DialogModal } from "@/components/ui/DialogModal";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
  getTransactionTypeLabel,
  formatDateShort,
} from "@/lib/utils";
import { useState } from "react";
import { EmployeeFormModal } from "./EmployeeFormModal";
import { toggleEmployeeStatus } from "@/lib/actions/employees";
import { useRouter } from "next/navigation";
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";

interface EmployeeDetailProps {
  employee: {
    id: string;
    employeeId: string;
    name: string;
    position: string;
    department: string;
    phone: string;
    address: string;
    joinDate: Date;
    status: string;
    baseSalary: unknown;
    fixedAllowance: unknown;
    notes?: string | null;
    transactions: Array<{
      id: string;
      transactionId: string;
      type: string;
      effect: string;
      amount: unknown;
      date: Date;
      description: string;
      status: string;
    }>;
    payrollDetails: Array<{
      id: string;
      netSalary: unknown;
      grossSalary: unknown;
      status: string;
      payrollPeriod: { month: number; year: number };
    }>;
  };
  stats: {
    unpaidBon: number;
    thisMonthDeductions: number;
    thisMonthAdditions: number;
    grossSalary: number;
    netSalary: number;
  } | null;
}

export function EmployeeDetail({ employee, stats }: EmployeeDetailProps) {
  const [showEditModal, setShowEditModal] = useState(false);
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

  const confirmToggle = async () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    const result = await toggleEmployeeStatus(employee.id, employee.status);
    if (result.success) {
      setDialog({
        isOpen: true,
        title: "Status Diperbarui",
        message: `Karyawan berhasil ${employee.status === "AKTIF" ? "dinonaktifkan" : "diaktifkan kembali"}.`,
        type: "success",
      });
      router.refresh();
    }
  };

  const handleToggleStatus = () => {
    const action =
      employee.status === "AKTIF" ? "menonaktifkan" : "mengaktifkan";
    setDialog({
      isOpen: true,
      title: `Konfirmasi ${action}?`,
      message: `Apakah Anda yakin ingin ${action} status karyawan "${employee.name}"?`,
      type: "confirm",
      onConfirm: confirmToggle,
    });
  };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  return (
    <div className="space-y-6">
      {/* Back & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/karyawan" className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0F172A] transition-colors">
          <ArrowLeft size={16} />
          Kembali ke Daftar Karyawan
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Edit2 size={14} />}
            onClick={() => setShowEditModal(true)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={
              employee.status === "AKTIF" ? (
                <UserX size={14} />
              ) : (
                <UserCheck size={14} />
              )
            }
            onClick={handleToggleStatus}
          >
            {employee.status === "AKTIF" ? "Nonaktifkan" : "Aktifkan"}
          </Button>
          <Link href={`/transaksi/bon?employeeId=${employee.id}&action=add`}>
            <Button size="sm" icon={<Plus size={14} />}>
              Tambah Transaksi
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-700">
                {employee.name.charAt(0)}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-[#0F172A]">
                  {employee.name}
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  {employee.position}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {employee.employeeId}
                  </span>
                  <Badge
                    label={getStatusLabel(employee.status)}
                    className={getStatusColor(employee.status)}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building2 size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">{employee.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">{employee.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">{formatDate(employee.joinDate)}</span>
              </div>
              {employee.address && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{employee.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Gaji Pokok"
            value={formatCurrency(Number(employee.baseSalary))}
            subtitle={`+ ${formatCurrency(Number(employee.fixedAllowance))} tunjangan`}
            icon={<DollarSign size={18} />}
            accentColor="bg-blue-50 text-blue-600"
          />
          <StatCard
            title="Bon Belum Lunas"
            value={formatCurrency(stats.unpaidBon)}
            subtitle="Kasbon aktif"
            icon={<TrendingDown size={18} />}
            accentColor="bg-orange-50 text-orange-600"
          />
          <StatCard
            title="Tambahan Bulan Ini"
            value={formatCurrency(stats.thisMonthAdditions)}
            subtitle="Bonus + insentif + lembur"
            icon={<TrendingUp size={18} />}
            accentColor="bg-green-50 text-green-600"
          />
          <StatCard
            title="Estimasi Gaji Bersih"
            value={formatCurrency(stats.netSalary)}
            subtitle="Estimasi bulan ini"
            icon={<Wallet size={18} />}
            accentColor="bg-slate-100 text-slate-600"
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Transaction History */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#E2E8F0]">
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Riwayat Transaksi
            </h2>
          </div>
          {employee.transactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-400">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {employee.transactions.map((trx) => (
                <div
                  key={trx.id}
                  className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#0F172A]">
                        {getTransactionTypeLabel(trx.type)}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getStatusColor(trx.status)}`}
                      >
                        {getStatusLabel(trx.status)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {trx.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-semibold ${
                        trx.effect === "PENAMBAH_GAJI"
                          ? "text-green-600"
                          : trx.effect === "PENGURANG_GAJI"
                          ? "text-red-600"
                          : "text-slate-700"
                      }`}
                    >
                      {trx.effect === "PENAMBAH_GAJI" ? "+" : trx.effect === "PENGURANG_GAJI" ? "-" : ""}
                      {formatCurrency(Number(trx.amount))}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDateShort(trx.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payroll History */}
        <div className="bg-white rounded-xl border border-[#E2E8F0]">
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Riwayat Gaji
            </h2>
          </div>
          {employee.payrollDetails.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-400">Belum ada riwayat gaji</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {employee.payrollDetails.map((detail) => (
                <div key={detail.id} className="px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">
                        {monthNames[detail.payrollPeriod.month - 1]}{" "}
                        {detail.payrollPeriod.year}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Kotor: {formatCurrency(Number(detail.grossSalary))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#0F172A]">
                        {formatCurrency(Number(detail.netSalary))}
                      </p>
                      <Badge
                        label={getStatusLabel(detail.status)}
                        className={`${getStatusColor(detail.status)} text-xs`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EmployeeFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          employee={employee}
        />
      )}

      {/* Dialog Modal */}
      <DialogModal
        isOpen={dialog.isOpen}
        onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={dialog.onConfirm}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />
    </div>
  );
}

