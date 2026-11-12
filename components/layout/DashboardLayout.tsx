"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/karyawan": "Data Karyawan",
  "/penggajian": "Penggajian",
  "/transaksi/bon": "Bon / Kasbon",
  "/transaksi/topup": "Top Up Dana",
  "/transaksi/tarik-tunai": "Tarik Tunai",
  "/transaksi/potongan": "Potongan Lainnya",
  "/slip-gaji": "Slip Gaji",
  "/laporan": "Laporan Keuangan",
  "/pengaturan": "Pengaturan",
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  const getTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (path !== "/" && pathname.startsWith(path)) return title;
    }
    if (pathname === "/") return "Dashboard";
    if (pathname.startsWith("/karyawan/")) return "Detail Karyawan";
    if (pathname.startsWith("/penggajian/")) return "Detail Penggajian";
    if (pathname.startsWith("/slip-gaji/")) return "Slip Gaji";
    return "PayrollPro";
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar
          title={getTitle()}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-6 overflow-y-auto">{children}</main>
        <MobileBottomNav />
      </div>
    </div>
  );
}

