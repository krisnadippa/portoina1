import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@payrollpro.id" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@payrollpro.id",
      password: "admin123", // In production, use bcrypt
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Admin user created:", adminUser.email);

  // Company settings
  const companySettings = [
    { key: "company_name", value: "PT. Maju Bersama Indonesia" },
    { key: "company_address", value: "Jl. Sudirman No. 123, Jakarta Pusat 10220" },
    { key: "company_phone", value: "+62 21 1234 5678" },
    { key: "company_email", value: "info@majubersama.id" },
    { key: "payroll_date", value: "25" },
    { key: "currency", value: "IDR" },
  ];

  for (const setting of companySettings) {
    await prisma.companySetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("✅ Company settings created");

  // Create employees
  const employees = [
    {
      employeeId: "EMP0001",
      name: "Budi Santoso",
      position: "Manager Keuangan",
      department: "Keuangan",
      phone: "08123456001",
      address: "Jl. Mangga No. 1, Jakarta",
      joinDate: new Date("2020-01-15"),
      baseSalary: new Prisma.Decimal(12000000),
      fixedAllowance: new Prisma.Decimal(2000000),
      status: "AKTIF",
    },
    {
      employeeId: "EMP0002",
      name: "Sari Dewi Rahayu",
      position: "Staff HR",
      department: "Human Resources",
      phone: "08123456002",
      address: "Jl. Melati No. 5, Bekasi",
      joinDate: new Date("2021-03-01"),
      baseSalary: new Prisma.Decimal(7000000),
      fixedAllowance: new Prisma.Decimal(1000000),
      status: "AKTIF",
    },
    {
      employeeId: "EMP0003",
      name: "Ahmad Fauzi",
      position: "Developer Senior",
      department: "IT",
      phone: "08123456003",
      address: "Jl. Kenanga No. 10, Tangerang",
      joinDate: new Date("2019-06-01"),
      baseSalary: new Prisma.Decimal(15000000),
      fixedAllowance: new Prisma.Decimal(3000000),
      status: "AKTIF",
    },
    {
      employeeId: "EMP0004",
      name: "Rini Wulandari",
      position: "Staff Administrasi",
      department: "Administrasi",
      phone: "08123456004",
      address: "Jl. Anggrek No. 7, Depok",
      joinDate: new Date("2022-01-10"),
      baseSalary: new Prisma.Decimal(5500000),
      fixedAllowance: new Prisma.Decimal(500000),
      status: "AKTIF",
    },
    {
      employeeId: "EMP0005",
      name: "Dian Pratiwi",
      position: "Marketing Executive",
      department: "Marketing",
      phone: "08123456005",
      address: "Jl. Mawar No. 3, Jakarta Selatan",
      joinDate: new Date("2021-08-15"),
      baseSalary: new Prisma.Decimal(8000000),
      fixedAllowance: new Prisma.Decimal(1500000),
      status: "AKTIF",
    },
  ];

  const createdEmployees = [];
  for (const emp of employees) {
    const created = await prisma.employee.upsert({
      where: { employeeId: emp.employeeId },
      update: {},
      create: emp,
    });
    createdEmployees.push(created);
  }
  console.log("✅ Employees created:", createdEmployees.length);

  // Create some transactions
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  // Create payroll period for current month
  const payrollPeriod = await prisma.payrollPeriod.upsert({
    where: { month_year: { month: thisMonth, year: thisYear } },
    update: {},
    create: {
      month: thisMonth,
      year: thisYear,
      status: "DRAFT",
    },
  });
  console.log("✅ Payroll period created for", thisMonth, "/", thisYear);

  // Sample transactions
  const transactions = [
    {
      transactionId: "BON-20261101-0001",
      employeeId: createdEmployees[0].id,
      type: "BON",
      effect: "PENGURANG_GAJI",
      amount: new Prisma.Decimal(1500000),
      date: new Date(),
      description: "Kasbon untuk keperluan mendesak",
      status: "DISETUJUI",
      payrollPeriodId: payrollPeriod.id,
      createdById: adminUser.id,
    },
    {
      transactionId: "BON-20261101-0002",
      employeeId: createdEmployees[1].id,
      type: "BON",
      effect: "PENGURANG_GAJI",
      amount: new Prisma.Decimal(500000),
      date: new Date(),
      description: "Kasbon biaya pengobatan",
      status: "DISETUJUI",
      payrollPeriodId: payrollPeriod.id,
      createdById: adminUser.id,
    },
    {
      transactionId: "BONUS-20261101-0001",
      employeeId: createdEmployees[2].id,
      type: "BONUS",
      effect: "PENAMBAH_GAJI",
      amount: new Prisma.Decimal(3000000),
      date: new Date(),
      description: "Bonus proyek selesai tepat waktu",
      status: "DISETUJUI",
      payrollPeriodId: payrollPeriod.id,
      createdById: adminUser.id,
    },
    {
      transactionId: "LEMBUR-20261101-0001",
      employeeId: createdEmployees[2].id,
      type: "LEMBUR",
      effect: "PENAMBAH_GAJI",
      amount: new Prisma.Decimal(1200000),
      date: new Date(),
      description: "Lembur 8 jam x 150.000",
      status: "DISETUJUI",
      payrollPeriodId: payrollPeriod.id,
      createdById: adminUser.id,
    },
    {
      transactionId: "TARIK-20261101-0001",
      employeeId: createdEmployees[3].id,
      type: "TARIK_TUNAI",
      effect: "PENGURANG_GAJI",
      amount: new Prisma.Decimal(800000),
      date: new Date(),
      description: "Penarikan uang muka gaji",
      status: "DISETUJUI",
      payrollPeriodId: payrollPeriod.id,
      createdById: adminUser.id,
    },
    {
      transactionId: "POTONGAN-20261101-0001",
      employeeId: createdEmployees[4].id,
      type: "POTONGAN",
      effect: "PENGURANG_GAJI",
      amount: new Prisma.Decimal(200000),
      date: new Date(),
      description: "Ketidakhadiran 1 hari",
      category: "Ketidakhadiran",
      status: "DISETUJUI",
      payrollPeriodId: payrollPeriod.id,
      createdById: adminUser.id,
    },
  ];

  for (const trx of transactions) {
    await prisma.employeeTransaction.upsert({
      where: { transactionId: trx.transactionId },
      update: {},
      create: trx,
    });
  }
  console.log("✅ Transactions created:", transactions.length);

  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

