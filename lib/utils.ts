// lib/utils.ts - Utility functions

export function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      if (typeof value === "bigint") return value.toString();
      return value;
    })
  );
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatPeriod(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function generateEmployeeId(sequence: number): string {
  return `EMP${String(sequence).padStart(4, "0")}`;
}

export function generateTransactionId(prefix: string): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${dateStr}-${random}`;
}

export function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    BON: "Bon / Kasbon",
    TOP_UP: "Top Up Dana",
    TARIK_TUNAI: "Tarik Tunai",
    POTONGAN: "Potongan",
    BONUS: "Bonus",
    INSENTIF: "Insentif",
    LEMBUR: "Lembur",
    KOMISI: "Komisi",
    TUNJANGAN_TAMBAHAN: "Tunjangan Tambahan",
  };
  return labels[type] || type;
}

export function getTransactionEffectLabel(effect: string): string {
  const labels: Record<string, string> = {
    PENGURANG_GAJI: "Pengurang Gaji",
    PENAMBAH_GAJI: "Penambah Gaji",
    OPERASIONAL: "Operasional",
  };
  return labels[effect] || effect;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    AKTIF: "Aktif",
    NONAKTIF: "Nonaktif",
    PENDING: "Pending",
    DISETUJUI: "Disetujui",
    DITOLAK: "Ditolak",
    LUNAS: "Lunas",
    CICILAN: "Cicilan",
    DRAFT: "Draft",
    DIPROSES: "Diproses",
    MENUNGGU_PEMBAYARAN: "Menunggu Pembayaran",
    DIBAYAR: "Dibayar",
    DIBATALKAN: "Dibatalkan",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AKTIF: "text-green-700 bg-green-50 border-green-200",
    NONAKTIF: "text-red-700 bg-red-50 border-red-200",
    PENDING: "text-yellow-700 bg-yellow-50 border-yellow-200",
    DISETUJUI: "text-green-700 bg-green-50 border-green-200",
    DITOLAK: "text-red-700 bg-red-50 border-red-200",
    LUNAS: "text-green-700 bg-green-50 border-green-200",
    CICILAN: "text-blue-700 bg-blue-50 border-blue-200",
    DRAFT: "text-gray-700 bg-gray-50 border-gray-200",
    DIPROSES: "text-blue-700 bg-blue-50 border-blue-200",
    MENUNGGU_PEMBAYARAN: "text-yellow-700 bg-yellow-50 border-yellow-200",
    DIBAYAR: "text-green-700 bg-green-50 border-green-200",
    DIBATALKAN: "text-red-700 bg-red-50 border-red-200",
  };
  return colors[status] || "text-gray-700 bg-gray-50 border-gray-200";
}

export function getTransactionTypeColor(type: string): string {
  const colors: Record<string, string> = {
    BON: "text-orange-700 bg-orange-50",
    TOP_UP: "text-blue-700 bg-blue-50",
    TARIK_TUNAI: "text-purple-700 bg-purple-50",
    POTONGAN: "text-red-700 bg-red-50",
    BONUS: "text-green-700 bg-green-50",
    INSENTIF: "text-teal-700 bg-teal-50",
    LEMBUR: "text-indigo-700 bg-indigo-50",
    KOMISI: "text-cyan-700 bg-cyan-50",
    TUNJANGAN_TAMBAHAN: "text-emerald-700 bg-emerald-50",
  };
  return colors[type] || "text-gray-700 bg-gray-50";
}

export function getMonthName(month: number): string {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[month - 1] || "";
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

