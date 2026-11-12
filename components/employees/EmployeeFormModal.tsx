"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createEmployee, updateEmployee } from "@/lib/actions/employees";
import { useRouter } from "next/navigation";

interface Employee {
  id?: string;
  name: string;
  position: string;
  department: string;
  phone: string;
  address?: string;
  joinDate?: Date | string;
  baseSalary?: unknown;
  fixedAllowance?: unknown;
  notes?: string | null;
  status?: string;
}

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
}

const departments = [
  "IT",
  "Keuangan",
  "Human Resources",
  "Marketing",
  "Operasional",
  "Administrasi",
  "Produksi",
  "Logistik",
  "Legal",
  "Lainnya",
];

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function EmployeeFormModal({
  isOpen,
  onClose,
  employee,
}: EmployeeFormModalProps) {
  const isEdit = !!employee?.id;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: employee?.name ?? "",
    position: employee?.position ?? "",
    department: employee?.department ?? "",
    phone: employee?.phone ?? "",
    address: (employee as { address?: string })?.address ?? "",
    joinDate: employee?.joinDate
      ? new Date(employee.joinDate as string).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    baseSalary: employee?.baseSalary ? String(Number(employee.baseSalary)) : "",
    fixedAllowance: employee?.fixedAllowance
      ? String(Number(employee.fixedAllowance))
      : "",
    notes: employee?.notes ?? "",
    status: employee?.status ?? "AKTIF",
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nama wajib diisi";
    if (!form.position.trim()) newErrors.position = "Jabatan wajib diisi";
    if (!form.department) newErrors.department = "Departemen wajib dipilih";
    if (!form.phone.trim()) newErrors.phone = "Nomor telepon wajib diisi";
    if (!form.joinDate) newErrors.joinDate = "Tanggal bergabung wajib diisi";
    if (!form.baseSalary || Number(form.baseSalary) <= 0)
      newErrors.baseSalary = "Gaji pokok wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = {
        name: form.name.trim(),
        position: form.position.trim(),
        department: form.department,
        phone: form.phone.trim(),
        address: form.address.trim(),
        joinDate: form.joinDate,
        baseSalary: Number(form.baseSalary),
        fixedAllowance: form.fixedAllowance ? Number(form.fixedAllowance) : 0,
        notes: form.notes || undefined,
        status: form.status,
      };

      const result = isEdit
        ? await updateEmployee(employee.id!, data)
        : await createEmployee(data);

      if (result.success) {
        onClose();
        router.refresh();
      } else {
        setServerError(result.error ?? "Terjadi kesalahan saat menyimpan data");
      }
    } catch {
      setServerError("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (name: string) =>
    `w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors ${
      errors[name]
        ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-100"
        : "border-[#E2E8F0] focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
    }`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Karyawan" : "Tambah Karyawan"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button loading={loading} onClick={handleSubmit as never}>
            {isEdit ? "Simpan Perubahan" : "Tambah Karyawan"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {serverError}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Nama Lengkap" error={errors.name} required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass("name")}
              placeholder="Contoh: Budi Santoso"
            />
          </FormField>

          <FormField label="Jabatan" error={errors.position} required>
            <input
              type="text"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className={inputClass("position")}
              placeholder="Contoh: Manager Keuangan"
            />
          </FormField>

          <FormField label="Departemen" error={errors.department} required>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className={`${inputClass("department")} cursor-pointer`}
            >
              <option value="">Pilih Departemen</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Nomor Telepon" error={errors.phone} required>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass("phone")}
              placeholder="08123456789"
            />
          </FormField>

          <FormField label="Tanggal Bergabung" error={errors.joinDate} required>
            <input
              type="date"
              value={form.joinDate}
              onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
              className={inputClass("joinDate")}
            />
          </FormField>

          {isEdit && (
            <FormField label="Status Karyawan">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={`${inputClass("status")} cursor-pointer`}
              >
                <option value="AKTIF">Aktif</option>
                <option value="NONAKTIF">Nonaktif</option>
              </select>
            </FormField>
          )}

          <FormField label="Gaji Pokok (Rp)" error={errors.baseSalary} required>
            <input
              type="number"
              value={form.baseSalary}
              onChange={(e) =>
                setForm({ ...form, baseSalary: e.target.value })
              }
              className={inputClass("baseSalary")}
              placeholder="5000000"
              min="0"
            />
          </FormField>

          <FormField label="Tunjangan Tetap (Rp)" error={errors.fixedAllowance}>
            <input
              type="number"
              value={form.fixedAllowance}
              onChange={(e) =>
                setForm({ ...form, fixedAllowance: e.target.value })
              }
              className={inputClass("fixedAllowance")}
              placeholder="0"
              min="0"
            />
          </FormField>
        </div>

        <FormField label="Alamat" error={errors.address}>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={inputClass("address")}
            placeholder="Jl. Contoh No. 1, Jakarta"
          />
        </FormField>

        <FormField label="Catatan" error={errors.notes}>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className={`${inputClass("notes")} resize-none`}
            rows={2}
            placeholder="Catatan tambahan (opsional)"
          />
        </FormField>
      </form>
    </Modal>
  );
}
