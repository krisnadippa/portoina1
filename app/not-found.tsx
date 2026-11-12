import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-slate-500 mb-6">
        Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}

