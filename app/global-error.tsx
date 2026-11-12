"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="p-8 text-center font-sans">
        <h2 className="text-xl font-bold text-red-600 mb-2">Terjadi kesalahan</h2>
        <p className="text-sm text-slate-600 mb-4">{error.message || "Kesalahan sistem tidak terduga"}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          Coba lagi
        </button>
      </body>
    </html>
  );
}

