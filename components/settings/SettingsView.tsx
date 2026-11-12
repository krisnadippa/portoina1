"use client";

import { useState } from "react";
import {
  Building2,
  DollarSign,
  Users,
  Shield,
  Save,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DialogModal } from "@/components/ui/DialogModal";
import {
  updateCompanySettings,
  updatePayrollSettings,
  createUser,
} from "@/lib/actions/settings";
import { useRouter } from "next/navigation";

interface SettingsData {
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
  payroll: {
    payrollDate: string;
    currency: string;
    bonAllocationRule: string;
    maxBonPercentage: string;
  };
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  }>;
}

export function SettingsView({ data }: { data: SettingsData }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"company" | "payroll" | "users">("company");

  // Company Form
  const [companyForm, setCompanyForm] = useState(data.company);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companySuccess, setCompanySuccess] = useState(false);

  // Payroll Form
  const [payrollForm, setPayrollForm] = useState(data.payroll);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollSuccess, setPayrollSuccess] = useState(false);

  // User Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN_KEUANGAN",
  });

  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "success" | "confirm" | "danger" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyLoading(true);
    setCompanySuccess(false);
    try {
      const res = await updateCompanySettings(companyForm);
      if (res.success) {
        setCompanySuccess(true);
        setDialog({
          isOpen: true,
          title: "Berhasil Disimpan",
          message: "Data profil perusahaan berhasil diperbarui.",
          type: "success",
        });
        setTimeout(() => setCompanySuccess(false), 3000);
        router.refresh();
      } else {
        setDialog({
          isOpen: true,
          title: "Gagal Menyimpan",
          message: res.error ?? "Terjadi kesalahan saat menyimpan pengaturan.",
          type: "danger",
        });
      }
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleSavePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayrollLoading(true);
    setPayrollSuccess(false);
    try {
      const res = await updatePayrollSettings(payrollForm);
      if (res.success) {
        setPayrollSuccess(true);
        setDialog({
          isOpen: true,
          title: "Berhasil Disimpan",
          message: "Pengaturan penggajian dan kebijakan bon berhasil disimpan.",
          type: "success",
        });
        setTimeout(() => setPayrollSuccess(false), 3000);
        router.refresh();
      } else {
        setDialog({
          isOpen: true,
          title: "Gagal Menyimpan",
          message: res.error ?? "Terjadi kesalahan saat menyimpan pengaturan.",
          type: "danger",
        });
      }
    } finally {
      setPayrollLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) {
      setDialog({
        isOpen: true,
        title: "Data Belum Lengkap",
        message: "Nama dan email wajib diisi.",
        type: "danger",
      });
      return;
    }
    setUserLoading(true);
    try {
      const res = await createUser(userForm);
      if (res.success) {
        setShowUserModal(false);
        setUserForm({ name: "", email: "", password: "", role: "ADMIN_KEUANGAN" });
        setDialog({
          isOpen: true,
          title: "Pengguna Ditambahkan",
          message: "Pengguna baru berhasil ditambahkan ke sistem.",
          type: "success",
        });
        router.refresh();
      } else {
        setDialog({
          isOpen: true,
          title: "Gagal Menambahkan",
          message: res.error ?? "Terjadi kesalahan saat menambahkan pengguna.",
          type: "danger",
        });
      }
    } finally {
      setUserLoading(false);
    }
  };

  const roleLabels: Record<string, { label: string; color: string; desc: string }> = {
    SUPER_ADMIN: {
      label: "Super Admin",
      color: "bg-purple-50 text-purple-700 border-purple-200",
      desc: "Akses penuh ke semua modul, pengguna, dan data keuangan.",
    },
    ADMIN_KEUANGAN: {
      label: "Admin Keuangan",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      desc: "Mengelola transaksi, kasbon, dan memproses penggajian.",
    },
    HR: {
      label: "HR / Pengelola Karyawan",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      desc: "Mengelola data karyawan, absensi, dan melihat slip gaji.",
    },
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-base font-semibold text-[#0F172A]">Pengaturan Sistem</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Konfigurasi profil perusahaan, aturan penggajian, dan manajemen hak akses
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] gap-4">
        <button
          onClick={() => setActiveTab("company")}
          className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "company"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 size={16} />
          Profil Perusahaan
        </button>

        <button
          onClick={() => setActiveTab("payroll")}
          className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "payroll"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <DollarSign size={16} />
          Kebijakan Penggajian
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "users"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users size={16} />
          Akun &amp; Hak Akses
        </button>
      </div>

      {/* Tab 1: Profil Perusahaan */}
      {activeTab === "company" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#0F172A]">Informasi Perusahaan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Data ini akan dicantumkan secara resmi di kop slip gaji dan laporan keuangan
            </p>
          </div>

          <form onSubmit={handleSaveCompany} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Nama Perusahaan
              </label>
              <input
                type="text"
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Alamat Kantor
              </label>
              <textarea
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-500"
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email Resmi
                </label>
                <input
                  type="email"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Button type="submit" loading={companyLoading} icon={<Save size={15} />}>
                Simpan Profil Perusahaan
              </Button>
              {companySuccess && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 size={15} /> Profil berhasil disimpan!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Pengaturan Penggajian */}
      {activeTab === "payroll" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#0F172A]">Aturan Penggajian &amp; Kasbon</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan tanggal cutoff pembayaran dan logika alokasi potongan otomatis
            </p>
          </div>

          <form onSubmit={handleSavePayroll} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Tanggal Penggajian (Tiap Bulan)
                </label>
                <select
                  value={payrollForm.payrollDate}
                  onChange={(e) => setPayrollForm({ ...payrollForm, payrollDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-500 cursor-pointer"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      Tanggal {d} setiap bulan
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Mata Uang Default
                </label>
                <input
                  type="text"
                  value="IDR (Rupiah - Rp)"
                  disabled
                  className="w-full px-3 py-2 text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Aturan Pengalokasian Bon &amp; Kasbon
              </label>
              <select
                value={payrollForm.bonAllocationRule}
                onChange={(e) =>
                  setPayrollForm({ ...payrollForm, bonAllocationRule: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="AUTO_DEDUCT">
                  Otomatis memotong langsung pada periode penggajian berjalan
                </option>
                <option value="APPROVAL_REQUIRED">
                  Perlu persetujuan berkala sebelum dipotongkan ke slip gaji
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Batas Maksimal Kasbon (% dari Gaji Pokok)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={payrollForm.maxBonPercentage}
                  onChange={(e) =>
                    setPayrollForm({ ...payrollForm, maxBonPercentage: e.target.value })
                  }
                  className="w-32 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-500"
                  min="10"
                  max="100"
                />
                <span className="text-xs text-slate-500">% dari gaji pokok</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Button type="submit" loading={payrollLoading} icon={<Save size={15} />}>
                Simpan Aturan Penggajian
              </Button>
              {payrollSuccess && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 size={15} /> Aturan berhasil disimpan!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Manajemen Akun & Hak Akses */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[#0F172A]">Daftar Pengguna Sistem</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pengguna yang memiliki hak akses mengelola karyawan dan keuangan
                </p>
              </div>
              <Button
                size="sm"
                icon={<UserPlus size={15} />}
                onClick={() => setShowUserModal(true)}
              >
                Tambah Pengguna
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {data.users.map((u) => {
                    const roleInfo = roleLabels[u.role] || {
                      label: u.role,
                      color: "bg-slate-100 text-slate-700",
                      desc: "",
                    };
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                        <td className="px-4 py-3 text-slate-600">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${roleInfo.color}`}>
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
                            Aktif
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Description Matrix */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
            <h3 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
              <Shield size={16} className="text-blue-600" />
              Matriks Hak Akses &amp; Wewenang
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(roleLabels).map(([key, val]) => (
                <div key={key} className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-slate-900">{val.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${val.color}`}>
                      {key}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Add User */}
      {showUserModal && (
        <Modal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          title="Tambah Pengguna Baru"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowUserModal(false)}>
                Batal
              </Button>
              <Button loading={userLoading} onClick={(e) => handleAddUser(e)}>
                Simpan Pengguna
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-500"
                placeholder="Contoh: Maya Anggraini"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-500"
                placeholder="nama@perusahaan.id"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Role / Hak Akses
              </label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN_KEUANGAN">Admin Keuangan</option>
                <option value="HR">HR / Pengelola Karyawan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Password Sementara
              </label>
              <input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-500"
                placeholder="Minimal 6 karakter"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Dialog Modal */}
      <DialogModal
        isOpen={dialog.isOpen}
        onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />
    </div>
  );
}

