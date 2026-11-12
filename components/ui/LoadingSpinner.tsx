// components/ui/LoadingSpinner.tsx
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-[#E2E8F0] border-t-blue-600`} />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500 mt-3">Memuat data...</p>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
      <div className="p-4 border-b border-[#E2E8F0]">
        <div className="h-4 bg-slate-100 rounded w-32 animate-pulse" />
      </div>
      <div className="divide-y divide-[#E2E8F0]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                className="h-4 bg-slate-100 rounded animate-pulse"
                style={{ width: `${Math.random() * 60 + 40}px` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

