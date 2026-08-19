import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getDeadlineInfo } from '../utils/dateUtils';

interface DeadlineBadgeProps {
  dueDate: string;
  dueTime?: string;
  isCompleted?: boolean;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({ dueDate, dueTime, isCompleted }) => {
  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider rounded-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-600/30 dark:border-emerald-500/30 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        DONE
      </span>
    );
  }

  const info = getDeadlineInfo(dueDate, dueTime);

  // Brutalist urgency styling
  let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  let icon = <Clock className="w-3.5 h-3.5 shrink-0" />;

  if (info.isOverdue) {
    badgeStyle = 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-600 dark:border-rose-500 font-extrabold';
    icon = <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />;
  } else if (info.isDueToday) {
    badgeStyle = 'bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-600 dark:border-amber-500 font-extrabold';
    icon = <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />;
  } else if (info.isDueTomorrow) {
    badgeStyle = 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/30';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider rounded-xs border ${badgeStyle} whitespace-nowrap`}
      title={`Due: ${info.formattedDue}`}
    >
      {icon}
      <span>{info.relativeText}</span>
    </span>
  );
};
