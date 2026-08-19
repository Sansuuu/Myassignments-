import { Assignment } from '../types';

export interface DeadlineInfo {
  category: 'overdue' | 'today' | 'tomorrow' | 'soon' | 'later';
  formattedDue: string;
  relativeText: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
    indicator: string;
  };
  isOverdue: boolean;
  isDueToday: boolean;
  isDueTomorrow: boolean;
  diffHours: number;
}

export function parseAssignmentDueDate(dueDate: string, dueTime?: string): Date {
  const time = dueTime && dueTime.includes(':') ? dueTime : '23:59';
  const [hours, minutes] = time.split(':').map(Number);
  const [year, month, day] = dueDate.split('-').map(Number);
  return new Date(year, month - 1, day, hours || 23, minutes || 59, 0, 0);
}

export function getDeadlineInfo(dueDateStr: string, dueTimeStr?: string): DeadlineInfo {
  const due = parseAssignmentDueDate(dueDateStr, dueTimeStr);
  const now = new Date();

  // Reset time to start of day for date comparisons
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const dayDiff = Math.round((dueDateOnly.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24));
  const diffMs = due.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  const timeDisplay = due.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateDisplay = due.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  // Overdue
  if (diffMs < 0) {
    const overdueDays = Math.abs(dayDiff);
    let text = 'Overdue';
    if (overdueDays === 0) {
      const hrs = Math.abs(diffHours);
      text = hrs <= 1 ? 'Overdue just now' : `Overdue by ${hrs} hrs`;
    } else if (overdueDays === 1) {
      text = 'Overdue by 1 day';
    } else {
      text = `Overdue by ${overdueDays} days`;
    }

    return {
      category: 'overdue',
      formattedDue: `${dateDisplay}, ${timeDisplay}`,
      relativeText: text,
      badgeColor: {
        bg: 'bg-red-500/10 dark:bg-red-950/40',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-500/20 dark:border-red-800/40',
        indicator: 'bg-red-500',
      },
      isOverdue: true,
      isDueToday: false,
      isDueTomorrow: false,
      diffHours,
    };
  }

  // Due today
  if (dayDiff === 0) {
    let text = 'Due Today';
    if (diffHours <= 1) {
      text = 'Due in less than 1 hr';
    } else if (diffHours < 24) {
      text = `Due in ${diffHours} hrs`;
    }

    return {
      category: 'today',
      formattedDue: `Today, ${timeDisplay}`,
      relativeText: text,
      badgeColor: {
        bg: 'bg-amber-500/10 dark:bg-amber-950/40',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/20 dark:border-amber-800/40',
        indicator: 'bg-amber-500',
      },
      isOverdue: false,
      isDueToday: true,
      isDueTomorrow: false,
      diffHours,
    };
  }

  // Due tomorrow
  if (dayDiff === 1) {
    return {
      category: 'tomorrow',
      formattedDue: `Tomorrow, ${timeDisplay}`,
      relativeText: 'Due Tomorrow',
      badgeColor: {
        bg: 'bg-yellow-500/10 dark:bg-yellow-950/40',
        text: 'text-yellow-600 dark:text-yellow-400',
        border: 'border-yellow-500/20 dark:border-yellow-800/40',
        indicator: 'bg-yellow-500',
      },
      isOverdue: false,
      isDueToday: false,
      isDueTomorrow: true,
      diffHours,
    };
  }

  // Due soon (within 3 days)
  if (dayDiff <= 3) {
    return {
      category: 'soon',
      formattedDue: `${dateDisplay}, ${timeDisplay}`,
      relativeText: `Due in ${dayDiff} days`,
      badgeColor: {
        bg: 'bg-blue-500/10 dark:bg-blue-950/40',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-500/20 dark:border-blue-800/40',
        indicator: 'bg-blue-500',
      },
      isOverdue: false,
      isDueToday: false,
      isDueTomorrow: false,
      diffHours,
    };
  }

  // Later
  return {
    category: 'later',
    formattedDue: `${dateDisplay}, ${timeDisplay}`,
    relativeText: `Due in ${dayDiff} days`,
    badgeColor: {
      bg: 'bg-slate-500/10 dark:bg-slate-800/40',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-500/20 dark:border-slate-700/40',
      indicator: 'bg-slate-400',
    },
    isOverdue: false,
    isDueToday: false,
    isDueTomorrow: false,
    diffHours,
  };
}

export function sortAssignmentsByUrgency(assignments: Assignment[]): Assignment[] {
  return [...assignments].sort((a, b) => {
    const dueA = parseAssignmentDueDate(a.dueDate, a.dueTime).getTime();
    const dueB = parseAssignmentDueDate(b.dueDate, b.dueTime).getTime();
    const now = Date.now();

    const isAOverdue = dueA < now;
    const isBOverdue = dueB < now;

    // Both overdue: most overdue first (earliest due date)
    if (isAOverdue && isBOverdue) {
      return dueA - dueB;
    }
    // A is overdue, B is not: A comes first
    if (isAOverdue && !isBOverdue) return -1;
    if (!isAOverdue && isBOverdue) return 1;

    // Neither is overdue: earliest deadline first
    return dueA - dueB;
  });
}
