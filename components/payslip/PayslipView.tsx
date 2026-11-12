"use client";

import { useRef } from "react";
import { Printer, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  formatCurrency,
  formatPeriod,
  formatDate,
} from "@/lib/utils";

interface PayslipData {
  detail: {
    id: string;
    employee: {
      name: string;
      employeeId: string;
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
    paidAt?: Date | null;
  };
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export function PayslipView({
  data,
  onClose,
}: {
  data: PayslipData;
  onClose?: () => void;
}) {
  const { detail, company } = data;
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const isPaid = detail.status === "DIBAYAR" || detail.payrollPeriod.status === "DIBAYAR";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#E2E8F0] overflow-hidden max-w-3xl mx-auto my-4">
      {/* Action Header - Hidden during print */}
      <div className="print:hidden flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#0F172A]">
            Pratinjau Slip Gaji
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
            {formatPeriod(detail.payrollPeriod.month, detail.payrollPeriod.year)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Printer size={15} />}
            onClick={handlePrint}
          >
            Cetak / Download PDF
          </Button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Printable Paper Area */}
      <div ref={printRef} className="p-8 md:p-10 font-sans text-slate-800 bg-white">
        {/* Company Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center shrink-0">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                {company.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{company.address}</p>
              <p className="text-xs text-slate-400">
                Telp: {company.phone} | Email: {company.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold tracking-wider uppercase rounded">
              SLIP GAJI KARYAWAN
            </span>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Periode: {formatPeriod(detail.payrollPeriod.month, detail.payrollPeriod.year)}
            </p>
          </div>
        </div>

        {/* Employee Info Grid */}
        <div className="grid grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-28 text-slate-500">ID Karyawan</span>
              <span className="font-semibold text-slate-900">: {detail.employee.employeeId}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500">Nama Lengkap</span>
              <span className="font-semibold text-slate-900">: {detail.employee.name}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500">Departemen</span>
              <span className="text-slate-800">: {detail.employee.department}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-32 text-slate-500">Jabatan</span>
              <span className="font-medium text-slate-900">: {detail.employee.position}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500">Tanggal Terbit</span>
              <span className="text-slate-800">: {formatDate(new Date())}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500">Status Pembayaran</span>
              <span className="font-medium">: {isPaid ? "SUDAH DIBAYAR" : "PENDING / PROSES"}</span>
            </div>
          </div>
        </div>

        {/* Earnings & Deductions Dual Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-200">
          {/* Column 1: Earnings */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2 mb-3">
              A. Penghasilan (Earnings)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Gaji Pokok</span>
                <span className="font-medium text-slate-900">{formatCurrency(Number(detail.baseSalary))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tunjangan Tetap</span>
                <span className="font-medium text-slate-900">{formatCurrency(Number(detail.fixedAllowance))}</span>
              </div>
              {Number(detail.bonus) > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Bonus</span>
                  <span className="font-medium text-slate-900">{formatCurrency(Number(detail.bonus))}</span>
                </div>
              )}
              {Number(detail.incentive) > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Insentif</span>
                  <span className="font-medium text-slate-900">{formatCurrency(Number(detail.incentive))}</span>
                </div>
              )}
              {Number(detail.overtime) > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Uang Lembur</span>
                  <span className="font-medium text-slate-900">{formatCurrency(Number(detail.overtime))}</span>
                </div>
              )}
              {Number(detail.otherIncome) > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Pendapatan Tambahan</span>
                  <span className="font-medium text-slate-900">{formatCurrency(Number(detail.otherIncome))}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-semibold text-slate-900">
                <span>Total Penghasilan Kotor</span>
                <span>{formatCurrency(Number(detail.grossSalary))}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Deductions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2 mb-3">
              B. Potongan (Deductions)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Bon / Kasbon</span>
                <span className="font-medium text-slate-900">{formatCurrency(Number(detail.bon))}</span>
              </div>
              {Number(detail.salaryAdvance) > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Uang Muka Gaji</span>
                  <span className="font-medium text-slate-900">{formatCurrency(Number(detail.salaryAdvance))}</span>
                </div>
              )}
              {Number(detail.otherDeductions) > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Potongan Lainnya / Denda</span>
                  <span className="font-medium text-slate-900">{formatCurrency(Number(detail.otherDeductions))}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-semibold text-red-600">
                <span>Total Potongan</span>
                <span>-{formatCurrency(Number(detail.totalDeductions))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Net Salary Highlight */}
        <div className="my-6 p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              GAJI BERSIH DITERIMA (TAKE HOME PAY)
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              (Total Penghasilan Kotor - Total Potongan)
            </p>
          </div>
          <span className="text-2xl font-bold text-slate-900">
            {formatCurrency(Number(detail.netSalary))}
          </span>
        </div>

        {/* Signatures */}
        <div className="pt-6 grid grid-cols-2 gap-12 text-center text-xs">
          <div>
            <p className="text-slate-500">Diterima Oleh,</p>
            <div className="h-16 flex items-end justify-center">
              <span className="font-medium text-slate-900 border-b border-slate-400 pb-0.5 w-40 inline-block">
                {detail.employee.name}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-1">Karyawan</p>
          </div>
          <div>
            <p className="text-slate-500">Disetujui Oleh,</p>
            <div className="h-16 flex items-end justify-center">
              <span className="font-medium text-slate-900 border-b border-slate-400 pb-0.5 w-40 inline-block">
                Bagian Keuangan / HR
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-1">{company.name}</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
          Dokumen ini diterbitkan secara otomatis oleh Sistem Penggajian PayrollPro dan sah tanpa tanda tangan basah jika diverifikasi secara internal.
        </div>
      </div>
    </div>
  );
}

