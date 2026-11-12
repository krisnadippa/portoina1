"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard caught error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4 border border-red-100 shadow-sm">
        <AlertCircle size={28} />
      </div>
      <h2 className="text-lg font-bold text-[#0F172A] mb-2">
        Gagal Memuat Halaman
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        Terjadi kendala saat memuat data dari database. Silakan muat ulang halaman atau periksa koneksi.
      </p>
      <Button onClick={() => reset()} className="inline-flex items-center gap-2">
        <RefreshCw size={16} />
        Muat Ulang
      </Button>
    </div>
  );
}
