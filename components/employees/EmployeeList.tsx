"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  UserCheck,
  UserX,
  Eye,
  Edit2,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DialogModal } from "@/components/ui/DialogModal";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import Link from "next/link";
import { EmployeeFormModal } from "./EmployeeFormModal";
import { deleteEmployee, toggleEmployeeStatus } from "@/lib/actions/employees";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  phone: string;
  joinDate: Date;
  status: string;
  baseSalary: unknown;
  fixedAllowance: unknown;
}

interface EmployeeListProps {
  employees: Employee[];
}

export function EmployeeList({ employees }: EmployeeListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
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

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || emp.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const confirmDelete = async (id: string) => {
    setDeletingId(id);
    setDialog((prev) => ({ ...prev, isOpen: false }));
    const result = await deleteEmployee(id);
    setDeletingId(null);
    if (result.success) {
      setDialog({
        isOpen: true,
        title: "Karyawan Dihapus",
        message: "Data karyawan berhasil dihapus dari sistem.",
        type: "success",
      });
      router.refresh();
    } else {
      setDialog({
        isOpen: true,
        title: "Gagal Menghapus",
        message: result.error || "Gagal menghapus karyawan.",
        type: "danger",
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDialog({
      isOpen: true,
      title: "Hapus Data Karyawan?",
      message: `Apakah Anda yakin ingin menghapus karyawan "${name}"? Seluruh riwayat transaksi akan ikut terhapus.`,
      type: "danger",
      onConfirm: () => confirmDelete(id),
    });
  };

  const confirmToggleStatus = async (id: string, status: string) => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    const result = await toggleEmployeeStatus(id, status);
    if (result.success) {
      setDialog({
        isOpen: true,
        title: "Status Diperbarui",
        message: `Status karyawan berhasil diubah menjadi ${status === "AKTIF" ? "Nonaktif" : "Aktif"}.`,
        type: "success",
      });
      router.refresh();
    } else {
      setDialog({
        isOpen: true,
        title: "Gagal",
        message: result.error || "Gagal mengubah status karyawan.",
        type: "danger",
      });
    }
  };

  const handleToggleStatus = (id: string, status: string) => {
    const action = status === "AKTIF" ? "menonaktifkan" : "mengaktifkan";
    setDialog({
      isOpen: true,
      title: `Konfirmasi ${action}?`,
      message: `Apakah Anda yakin ingin ${action} status karyawan ini?`,
      type: "confirm",
      onConfirm: () => confirmToggleStatus(id, status),
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#0F172A]">
            Daftar Karyawan
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {employees.filter((e) => e.status === "AKTIF").length} karyawan
            aktif dari {employees.length} total
          </p>
        </div>
        <Button
          icon={<Plus size={16} />}
          onClick={() => {
            setEditEmployee(null);
            setShowModal(true);
          }}
        >
          Tambah Karyawan
        </Button>
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
            placeholder="Cari nama, ID, atau departemen..."
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
          <option value="ALL">Semua Status</option>
          <option value="AKTIF">Aktif</option>
          <option value="NONAKTIF">Nonaktif</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={32} />}
            title="Belum ada karyawan"
            description={
              search
                ? "Tidak ada karyawan yang sesuai dengan pencarian"
                : "Tambahkan karyawan pertama untuk memulai"
            }
            action={
              !search ? (
                <Button
                  icon={<Plus size={16} />}
                  onClick={() => setShowModal(true)}
                >
                  Tambah Karyawan
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
                    Karyawan
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                    Departemen
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                    Bergabung
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                    Gaji Pokok
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
                {filtered.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-blue-700">
                            {emp.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#0F172A]">
                            {emp.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {emp.employeeId} · {emp.position}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-slate-700">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-slate-600">
                        {formatDate(emp.joinDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                      <span className="text-sm font-medium text-[#0F172A]">
                        {formatCurrency(Number(emp.baseSalary))}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        label={getStatusLabel(emp.status)}
                        className={getStatusColor(emp.status)}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/karyawan/${emp.id}`}>
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors">
                            <Eye size={15} />
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            setEditEmployee(emp);
                            setShowModal(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleStatus(emp.id, emp.status)
                          }
                          className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                            emp.status === "AKTIF"
                              ? "text-slate-500 hover:text-yellow-600"
                              : "text-slate-500 hover:text-green-600"
                          }`}
                          title={
                            emp.status === "AKTIF"
                              ? "Nonaktifkan"
                              : "Aktifkan"
                          }
                        >
                          {emp.status === "AKTIF" ? (
                            <UserX size={15} />
                          ) : (
                            <UserCheck size={15} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id, emp.name)}
                          disabled={deletingId === emp.id}
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
        <EmployeeFormModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditEmployee(null);
          }}
          employee={editEmployee}
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

