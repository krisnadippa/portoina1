"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createTransaction, getDefaultAdmin } from "@/lib/actions/transactions";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  status: string;
}

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  employees: Employee[];
  defaultEmployeeId?: string;
}

const typeConfig: Record<
  string,
  {
    label: string;
    defaultEffect: string;
    effects: { value: string; label: string }[];
    statuses: { value: string; label: string }[];
    categories?: { value: string; label: string }[];
    paymentMethods?: { value: string; label: string }[];
    description: string;
  }
> = {
  BON: {
    label: "Bon / Kasbon",
    defaultEffect: "PENGURANG_GAJI",
    effects: [{ value: "PENGURANG_GAJI", label: "Pengurang Gaji (Kasbon)" }],
    statuses: [
      { value: "DISETUJUI", label: "Belum Lunas" },
      { value: "CICILAN", label: "Cicilan" },
      { value: "LUNAS", label: "Lunas" },
    ],
    paymentMethods: [
      { value: "Tunai", label: "Tunai" },
      { value: "Transfer Bank", label: "Transfer Bank" },
    ],
    description: "Kasbon akan otomatis menjadi pengurang gaji pada periode penggajian",
  },
  TOP_UP: {
    label: "Top Up Dana",
    defaultEffect: "PENGURANG_GAJI",
    effects: [
      { value: "PENGURANG_GAJI", label: "Uang Muka Gaji (mengurangi gaji)" },
      { value: "OPERASIONAL", label: "Dana Operasional (tidak mempengaruhi gaji)" },
      { value: "PENAMBAH_GAJI", label: "Dana Pribadi Karyawan" },
    ],
    statuses: [
      { value: "DISETUJUI", label: "Disetujui" },
      { value: "PENDING", label: "Pending" },
    ],
    description: "Pilih jenis transaksi dengan cermat karena mempengaruhi perhitungan gaji",
  },
  TARIK_TUNAI: {
    label: "Tarik Tunai",
    defaultEffect: "PENGURANG_GAJI",
    effects: [
      { value: "PENGURANG_GAJI", label: "Uang Muka Gaji (mengurangi gaji)" },
      { value: "OPERASIONAL", label: "Pengembalian Dana / Operasional" },
    ],
    statuses: [
      { value: "DISETUJUI", label: "Disetujui" },
      { value: "PENDING", label: "Pending" },
    ],
    paymentMethods: [
      { value: "Tunai", label: "Tunai" },
      { value: "ATM", label: "ATM" },
      { value: "Transfer Bank", label: "Transfer Bank" },
    ],
    description: "Catat penarikan tunai oleh karyawan",
  },
  POTONGAN: {
    label: "Potongan",
    defaultEffect: "PENGURANG_GAJI",
    effects: [{ value: "PENGURANG_GAJI", label: "Pengurang Gaji" }],
    statuses: [{ value: "DISETUJUI", label: "Disetujui" }],
    categories: [
      { value: "Denda", label: "Denda" },
      { value: "Pinjaman", label: "Pinjaman" },
      { value: "Ketidakhadiran", label: "Ketidakhadiran" },
      { value: "Potongan Lainnya", label: "Potongan Lainnya" },
    ],
    description: "Catat potongan khusus seperti denda atau pinjaman",
  },
  BONUS: {
    label: "Bonus",
    defaultEffect: "PENAMBAH_GAJI",
    effects: [{ value: "PENAMBAH_GAJI", label: "Penambah Gaji" }],
    statuses: [{ value: "DISETUJUI", label: "Disetujui" }],
    description: "Catat bonus untuk karyawan",
  },
  INSENTIF: {
    label: "Insentif",
    defaultEffect: "PENAMBAH_GAJI",
    effects: [{ value: "PENAMBAH_GAJI", label: "Penambah Gaji" }],
    statuses: [{ value: "DISETUJUI", label: "Disetujui" }],
    description: "Catat insentif pencapaian karyawan",
  },
  LEMBUR: {
    label: "Lembur",
    defaultEffect: "PENAMBAH_GAJI",
    effects: [{ value: "PENAMBAH_GAJI", label: "Penambah Gaji" }],
    statuses: [{ value: "DISETUJUI", label: "Disetujui" }],
    description: "Catat pembayaran lembur karyawan",
  },
};

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

export function TransactionFormModal({
  isOpen,
  onClose,
  type,
  employees,
  defaultEmployeeId,
}: TransactionFormModalProps) {
  const config = typeConfig[type] ?? typeConfig.BON;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const [form, setForm] = useState({
    employeeId: defaultEmployeeId ?? "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    description: "",
    effect: config.defaultEffect,
    status: config.statuses[0].value,
    paymentMethod: config.paymentMethods?.[0]?.value ?? "",
    category: config.categories?.[0]?.value ?? "",
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.employeeId) newErrors.employeeId = "Karyawan wajib dipilih";
    if (!form.amount || Number(form.amount) <= 0)
      newErrors.amount = "Nominal wajib diisi dan harus lebih dari 0";
    if (!form.date) newErrors.date = "Tanggal wajib diisi";
    if (!form.description.trim()) newErrors.description = "Keterangan wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError(null);
    try {
      const admin = await getDefaultAdmin();
      if (!admin) {
        setServerError("Admin user tidak ditemukan. Pastikan database sudah terisi.");
        return;
      }

      const result = await createTransaction({
        employeeId: form.employeeId,
        type,
        effect: form.effect,
        amount: Number(form.amount),
        date: form.date,
        description: form.description.trim(),
        paymentMethod: form.paymentMethod || undefined,
        status: form.status,
        category: form.category || undefined,
        createdById: admin.id,
      });

      if (result.success) {
        onClose();
        router.refresh();
      } else {
        setServerError(result.error ?? "Gagal menyimpan transaksi");
      }
    } catch {
      setServerError("Terjadi kendala saat menyimpan transaksi");
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

  const activeEmployees = employees.filter((e) => e.status === "AKTIF");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tambah ${config.label}`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button loading={loading} onClick={handleSubmit as never}>
            Simpan Transaksi
          </Button>
        </>
      }
    >
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">{config.description}</p>
      </div>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Karyawan" error={errors.employeeId} required>
          <select
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            className={`${inputClass("employeeId")} cursor-pointer`}
          >
            <option value="">Pilih Karyawan</option>
            {activeEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.employeeId})
              </option>
            ))}
          </select>
        </FormField>

        {config.effects.length > 1 && (
          <FormField label="Jenis Transaksi" error={errors.effect} required>
            <select
              value={form.effect}
              onChange={(e) => setForm({ ...form, effect: e.target.value })}
              className={`${inputClass("effect")} cursor-pointer`}
            >
              {config.effects.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </FormField>
        )}

        {config.categories && (
          <FormField label="Kategori Potongan" error={errors.category} required>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={`${inputClass("category")} cursor-pointer`}
            >
              {config.categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </FormField>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nominal (Rp)" error={errors.amount} required>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className={inputClass("amount")}
              placeholder="1000000"
              min="0"
            />
          </FormField>

          <FormField label="Tanggal" error={errors.date} required>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass("date")}
            />
          </FormField>
        </div>

        {config.paymentMethods && (
          <FormField label="Metode Pembayaran" error={errors.paymentMethod}>
            <select
              value={form.paymentMethod}
              onChange={(e) =>
                setForm({ ...form, paymentMethod: e.target.value })
              }
              className={`${inputClass("paymentMethod")} cursor-pointer`}
            >
              {config.paymentMethods.map((pm) => (
                <option key={pm.value} value={pm.value}>
                  {pm.label}
                </option>
              ))}
            </select>
          </FormField>
        )}

        <FormField label="Status" error={errors.status}>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className={`${inputClass("status")} cursor-pointer`}
          >
            {config.statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Keterangan" error={errors.description} required>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className={`${inputClass("description")} resize-none`}
            rows={3}
            placeholder="Deskripsi transaksi..."
          />
        </FormField>
      </form>
    </Modal>
  );
}
