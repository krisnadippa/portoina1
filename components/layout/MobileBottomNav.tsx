"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ArrowRightLeft,
  Banknote,
  FileText,
} from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Beranda",
    icon: LayoutDashboard,
    isActive: (pathname: string) => pathname === "/",
  },
  {
    href: "/karyawan",
    label: "Karyawan",
    icon: Users,
    isActive: (pathname: string) => pathname.startsWith("/karyawan"),
  },
  {
    href: "/transaksi/bon",
    label: "Transaksi",
    icon: ArrowRightLeft,
    isActive: (pathname: string) => pathname.startsWith("/transaksi"),
  },
  {
    href: "/penggajian",
    label: "Gaji",
    icon: Banknote,
    isActive: (pathname: string) => pathname.startsWith("/penggajian"),
  },
  {
    href: "/slip-gaji",
    label: "Slip Gaji",
    icon: FileText,
    isActive: (pathname: string) => pathname.startsWith("/slip-gaji"),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-2 py-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                active
                  ? "text-blue-600 font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  active ? "bg-blue-50 text-blue-600" : ""
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

