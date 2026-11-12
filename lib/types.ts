// lib/types.ts - Core TypeScript types for the application

export type EmployeeStatus = "AKTIF" | "NONAKTIF";

export type TransactionType =
  | "BON"
  | "TOP_UP"
  | "TARIK_TUNAI"
  | "POTONGAN"
  | "BONUS"
  | "INSENTIF"
  | "LEMBUR"
  | "KOMISI"
  | "TUNJANGAN_TAMBAHAN";

export type TransactionEffect =
  | "PENGURANG_GAJI"
  | "PENAMBAH_GAJI"
  | "OPERASIONAL";

export type TransactionStatus =
  | "PENDING"
  | "DISETUJUI"
  | "DITOLAK"
  | "LUNAS"
  | "CICILAN";

export type PayrollStatus =
  | "DRAFT"
  | "DIPROSES"
  | "MENUNGGU_PEMBAYARAN"
  | "DIBAYAR"
  | "DIBATALKAN";

export type UserRole = "SUPER_ADMIN" | "ADMIN_KEUANGAN" | "HR";

export interface Company {
  id: string;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  payrollDate: number;
  currency: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  photo?: string;
  position: string;
  department: string;
  phone: string;
  address: string;
  joinDate: string;
  status: EmployeeStatus;
  baseSalary: number;
  fixedAllowance: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeTransaction {
  id: string;
  transactionId: string;
  employeeId: string;
  employee?: Employee;
  type: TransactionType;
  effect: TransactionEffect;
  amount: number;
  date: string;
  description: string;
  paymentMethod?: string;
  status: TransactionStatus;
  payrollPeriodId?: string;
  category?: string;
  createdBy: string;
  createdAt: string;
}

export interface PayrollPeriod {
  id: string;
  month: number;
  year: number;
  status: PayrollStatus;
  lockedAt?: string;
  processedAt?: string;
  paidAt?: string;
  createdAt: string;
  details?: PayrollDetail[];
}

export interface PayrollDetail {
  id: string;
  payrollPeriodId: string;
  employeeId: string;
  employee?: Employee;
  baseSalary: number;
  fixedAllowance: number;
  bonus: number;
  incentive: number;
  overtime: number;
  otherIncome: number;
  grossSalary: number;
  bon: number;
  salaryAdvance: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  paidAt?: string;
}

export interface Payslip {
  id: string;
  payrollDetailId: string;
  employeeId: string;
  employee?: Employee;
  payrollDetail?: PayrollDetail;
  period: string;
  issuedAt: string;
  isLocked: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardStats {
  totalActiveEmployees: number;
  totalMonthlySalary: number;
  totalBon: number;
  totalFundsDisbursed: number;
  totalDeductionsThisMonth: number;
  totalNetSalaryDue: number;
}

export interface RecentActivity {
  id: string;
  employeeName: string;
  transactionType: TransactionType;
  amount: number;
  date: string;
  status: TransactionStatus;
}

