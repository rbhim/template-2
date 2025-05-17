import { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  colorClass?: string;
}

export default function StatsCard({ icon, label, value, colorClass = "text-blue-600" }: StatsCardProps) {
  return (
    <div
      className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow p-4 min-w-[180px] hover:scale-[1.03] hover:shadow-lg transition-transform duration-200 group"
      tabIndex={0}
      aria-label={label}
    >
      <div className={`w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mr-4 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <div className="text-lg font-semibold text-gray-900 dark:text-white">{label}</div>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
      </div>
    </div>
  );
} 