"use client";

import { Bell, Search, User, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";

interface TopbarProps {
  title: string;
  onMenuClick?: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center px-4 sm:px-6 gap-3 sm:gap-4 shrink-0">
      {/* Mobile Menu Button */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg md:hidden"
          title="Buka Menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base sm:text-lg font-semibold text-[#0F172A] truncate">{title}</h1>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Cari karyawan, transaksi..."
          className="pl-9 pr-4 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg w-72 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-colors"
        />
      </div>

      {/* Notification */}
      <div className="relative">
        <button
          onClick={() => {
            setShowNotif(!showNotif);
            setShowProfile(false);
          }}
          className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>
        {showNotif && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E2E8F0]">
              <p className="font-semibold text-sm text-[#0F172A]">Notifikasi</p>
            </div>
            <div className="py-2">
              <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                <p className="text-sm text-[#0F172A] font-medium">
                  Penggajian November 2026 belum diproses
                </p>
                <p className="text-xs text-slate-500 mt-0.5">2 jam lalu</p>
              </div>
              <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                <p className="text-sm text-[#0F172A] font-medium">
                  3 bon karyawan menunggu konfirmasi
                </p>
                <p className="text-xs text-slate-500 mt-0.5">5 jam lalu</p>
              </div>
            </div>
            <div className="px-4 py-2 border-t border-[#E2E8F0]">
              <button className="text-sm text-blue-600 hover:underline w-full text-center">
                Lihat semua notifikasi
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => {
            setShowProfile(!showProfile);
            setShowNotif(false);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-[#0F172A] leading-tight">
              Super Admin
            </p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
          <ChevronDown size={14} className="text-slate-400 hidden md:block" />
        </button>
        {showProfile && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="py-1">
              <button className="w-full text-left px-4 py-2.5 text-sm text-[#0F172A] hover:bg-slate-50">
                Profil Saya
              </button>
              <button className="w-full text-left px-4 py-2.5 text-sm text-[#0F172A] hover:bg-slate-50">
                Pengaturan
              </button>
              <div className="border-t border-[#E2E8F0] my-1" />
              <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlay to close dropdowns */}
      {(showNotif || showProfile) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotif(false);
            setShowProfile(false);
          }}
        />
      )}
    </header>
  );
}

