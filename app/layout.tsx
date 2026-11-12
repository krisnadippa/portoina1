import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayrollPro - Employee Payroll Management",
  description: "Sistem manajemen penggajian karyawan profesional",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
