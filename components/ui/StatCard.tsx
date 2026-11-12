// components/ui/StatCard.tsx
interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  accentColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = "bg-blue-50 text-blue-600",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-500 font-medium truncate">{title}</p>
          <p className="text-2xl font-bold text-[#0F172A] mt-1 truncate">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 truncate">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`text-xs mt-1.5 font-medium ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div
          className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${accentColor}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

