import React from 'react';
import { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'sm' }) => {
  const configs = {
    high: {
      label: 'HIGH PRIORITY',
      classes: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-600/30 dark:border-rose-500/30',
      dot: 'bg-rose-600 dark:bg-rose-400',
    },
    medium: {
      label: 'MED PRIORITY',
      classes: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-600/30 dark:border-amber-500/30',
      dot: 'bg-amber-600 dark:bg-amber-400',
    },
    low: {
      label: 'LOW PRIORITY',
      classes: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
      dot: 'bg-slate-500 dark:bg-slate-400',
    },
  };

  const config = configs[priority] || configs.medium;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider rounded-sm border ${config.classes} ${padding} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-xs ${config.dot}`} />
      {config.label}
    </span>
  );
};
