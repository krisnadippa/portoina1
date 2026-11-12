"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DialogModal } from "@/components/ui/DialogModal";
import {
  formatCurrency,
  formatDateShort,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import { TransactionFormModal } from "./TransactionFormModal";
import { deleteTransaction } from "@/lib/actions/transactions";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  transactionId: string;
  type: string;
  effect: string;
  amount: unknown;
  date: Date;
  description: string;
  status: string;
  category?: string | null;
  employee: { id: string; name: string; position: string; employeeId: string } | null;
  createdBy: { name: string } | null;
}

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  status: string;
}

interface TransactionPageProps {
  type: string;
  title: string;
  description: string;
  transactions: Transaction[];
  employees: Employee[];
}

export function TransactionPage({
  type,
  title,
  description,
  transactions,
  employees,
}: TransactionPageProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  const filtered = transactions.filter((trx) => {
    const matchSearch =
      trx.employee?.name.toLowerCase().includes(search.toLowerCase()) ||
      trx.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      trx.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || trx.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalAmount = filtered.reduce((sum, t) => sum + Number(t.amount), 0);

  const confirmDelete = async (id: string) => {
    setDeletingId(id);
    setDialog((prev) => ({ ...prev, isOpen: false }));
    const result = await deleteTransaction(id);
    setDeletingId(null);
    if (result.success) {
      setDialog({
        isOpen: true,
        title: "Transaksi Dihapus",
        message: "Data transaksi berhasil dihapus dan kalkulasi gaji karyawan terkait otomatis diperbarui.",
        type: "success",
      });
      router.refresh();
    } else {
      setDialog({
        isOpen: true,
        title: "Gagal Menghapus",
        message: result.error || "Gagal menghapus transaksi.",
        type: "danger",
      });
    }
  };

  const handleDelete = (id: string) => {
    setDialog({
      isOpen: true,
      title: "Hapus Transaksi?",
      message: "Apakah Anda yakin ingin menghapus transaksi ini? Komponen gaji karyawan akan otomatis disesuaikan kembali.",
      type: "danger",
      onConfirm: () => confirmDelete(id),
    });
  };

  const getStatusOptions = () => {
    if (type === "BON") {
      return ["ALL", "PENDING", "DISETUJUI", "LUNAS", "CICILAN"];
    }
    return ["ALL", "PENDING", "DISETUJUI", "DITOLAK"];
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#0F172A]">{title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
        <Button
          icon={<Plus size={16} />}
          onClick={() => setShowModal(true)}
        >
          Tambah {title}
        </Button>
      </div>

      {/* Summary */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-[#E2E8F0] px-4 py-3">
            <p className="text-xs text-slate-500">Total Transaksi</p>
            <p className="text-lg font-bold text-[#0F172A] mt-0.5">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E2E8F0] px-4 py-3">
            <p className="text-xs text-slate-500">Total Nominal</p>
            <p className="text-lg font-bold text-[#0F172A] mt-0.5">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E2E8F0] px-4 py-3">
            <p className="text-xs text-slate-500">Sudah Lunas</p>
            <p className="text-lg font-bold text-green-600 mt-0.5">
              {filtered.filter((t) => t.status === "LUNAS").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-[#E2E8F0] px-4 py-3">
            <p className="text-xs text-slate-500">Belum Lunas</p>
            <p className="text-lg font-bold text-orange-600 mt-0.5">
              {filtered.filter((t) => t.status === "DISETUJUI").length}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari karyawan, ID transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white outline-none focus:border-blue-500 cursor-pointer"
        >
          {getStatusOptions().map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "Semua Status" : getStatusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<ArrowUpDown size={32} />}
            title={`Belum ada ${title}`}
            description={
              search
                ? "Tidak ada transaksi yang sesuai dengan pencarian"
                : `Tambahkan ${title.toLowerCase()} pertama`
            }
            action={
              !search ? (
                <Button
                  icon={<Plus size={16} />}
                  onClick={() => setShowModal(true)}
                >
                  Tambah {title}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    ID Transaksi
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Karyawan
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                    Keterangan
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                    Tanggal
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Nominal
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {trx.transactionId}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-blue-700">
                            {trx.employee?.name.charAt(0) ?? "?"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#0F172A]">
                            {trx.employee?.name ?? "—"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {trx.employee?.employeeId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-slate-700 max-w-xs truncate">
                        {trx.description}
                      </p>
                      {trx.category && (
                        <span className="text-xs text-slate-400">{trx.category}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-slate-600">
                        {formatDateShort(trx.date)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`text-sm font-semibold ${
                        trx.effect === "PENAMBAH_GAJI" ? "text-green-600" :
                        trx.effect === "PENGURANG_GAJI" ? "text-[#0F172A]" :
                        "text-blue-600"
                      }`}>
                        {formatCurrency(Number(trx.amount))}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {trx.effect === "PENGURANG_GAJI" ? "Potongan" :
                         trx.effect === "PENAMBAH_GAJI" ? "Tambahan" : "Operasional"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        label={getStatusLabel(trx.status)}
                        className={getStatusColor(trx.status)}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleDelete(trx.id)}
                          disabled={deletingId === trx.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <TransactionFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          type={type}
          employees={employees}
        />
      )}

      <DialogModal
        isOpen={dialog.isOpen}
        onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        loading={!!deletingId}
      />
    </div>
  );
}

