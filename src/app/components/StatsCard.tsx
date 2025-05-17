import { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  colorClass?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgClass?: string;
}

export default function StatsCard({ 
  icon, 
  label, 
  value, 
  colorClass = "text-blue-600",
  trend,
  bgClass
}: StatsCardProps) {
  // Generate the background gradient class based on the color
  const gradientBg = bgClass || (
    colorClass.includes('blue') ? 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30' :
    colorClass.includes('green') ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30' :
    colorClass.includes('red') ? 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30' :
    colorClass.includes('purple') ? 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30' :
    'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30'
  );

  return (
    <div
      className={`flex items-center bg-gradient-to-br ${gradientBg} backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/50 shadow-lg p-5 min-w-[180px] hover:scale-[1.03] hover:shadow-xl transition-all duration-300 group animate-fade-in overflow-hidden relative`}
      tabIndex={0}
      aria-label={label}
    >
      {/* Decorative circle in background */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/10 dark:bg-white/5"></div>
      
      <div className={`w-12 h-12 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 mr-4 shadow-md ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</div>
        <div className="flex items-center gap-2">
          <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
          
          {trend && (
            <div className={`flex items-center text-xs px-1.5 py-0.5 rounded ${
              trend.isPositive ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30' : 
              'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'
            }`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 