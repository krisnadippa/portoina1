"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowRightLeft,
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  Scissors,
  Menu,
  X,
  Building2,
} from "lucide-react";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string; icon: React.ElementType }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Data Karyawan", href: "/karyawan", icon: Users },
  { label: "Penggajian", href: "/penggajian", icon: CreditCard },
  {
    label: "Transaksi",
    icon: ArrowRightLeft,
    children: [
      { label: "Bon / Kasbon", href: "/transaksi/bon", icon: Wallet },
      { label: "Top Up Dana", href: "/transaksi/topup", icon: TrendingUp },
      { label: "Tarik Tunai", href: "/transaksi/tarik-tunai", icon: TrendingDown },
      { label: "Potongan Lainnya", href: "/transaksi/potongan", icon: Scissors },
    ],
  },
  { label: "Slip Gaji", href: "/slip-gaji", icon: FileText },
  { label: "Laporan", href: "/laporan", icon: BarChart3 },
  { label: "Pengaturan", href: "/pengaturan", icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(["Transaksi"]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isGroupActive = (children?: NavItem["children"]) => {
    return children?.some((child) => isActive(child.href)) ?? false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`flex flex-col bg-[#1E293B] text-white transition-all duration-300 ease-in-out shrink-0 h-full
          fixed inset-y-0 left-0 z-50 md:static md:z-auto
          ${isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-16" : "md:w-64"}
          w-64
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white leading-tight whitespace-nowrap">
                  PayrollPro
                </p>
                <p className="text-xs text-slate-400 whitespace-nowrap">
                  Manajemen Penggajian
                </p>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="p-1 rounded-md text-slate-400 hover:text-white md:hidden"
            title="Tutup Menu"
          >
            <X size={18} />
          </button>
        </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openGroups.includes(item.label);
            const active = hasChildren
              ? isGroupActive(item.children)
              : isActive(item.href);

            if (hasChildren) {
              return (
                <li key={item.label}>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-blue-600/20 text-blue-400"
                        : "text-slate-300 hover:bg-slate-700/60 hover:text-white"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left truncate">
                          {item.label}
                        </span>
                        {isOpen ? (
                          <ChevronDown size={14} className="shrink-0 opacity-70" />
                        ) : (
                          <ChevronRight size={14} className="shrink-0 opacity-70" />
                        )}
                      </>
                    )}
                  </button>
                  {!isCollapsed && isOpen && (
                    <ul className="mt-0.5 ml-4 space-y-0.5">
                      {item.children?.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = isActive(child.href);
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={onMobileClose}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                childActive
                                  ? "bg-blue-600 text-white"
                                  : "text-slate-400 hover:bg-slate-700/60 hover:text-white"
                              }`}
                            >
                              <ChildIcon size={16} className="shrink-0" />
                              <span className="truncate">{child.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.label}>
                <Link
                  href={item.href!}
                  onClick={onMobileClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700/60 hover:text-white"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={18} className="shrink-0" />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Toggle Button for desktop */}
      <div className="hidden md:block p-3 border-t border-slate-700">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-slate-400 hover:bg-slate-700/60 hover:text-white transition-colors text-sm"
        >
          {isCollapsed ? <Menu size={18} /> : <X size={18} />}
          {!isCollapsed && <span>Tutup Sidebar</span>}
        </button>
      </div>
    </aside>
    </>
  );
}

