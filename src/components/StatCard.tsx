import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  badge?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  badge,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] p-5 transition-all duration-200 brutal-shadow ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#2A2A2A]' : ''
      }`}
    >
      {/* Decorative top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {title}
            </span>
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-[#F5F5F0] font-display">
            {value}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-slate-900/20 dark:border-white/10"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {badge && (
        <div className="mt-3 flex items-center">
          <span className="inline-flex items-center rounded-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};
