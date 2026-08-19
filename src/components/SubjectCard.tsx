import React from 'react';
import { Subject, Assignment, StudentProgress } from '../types';
import { BookOpen, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  assignments: Assignment[];
  progressMap: Record<string, StudentProgress>;
  onClick: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  assignments,
  progressMap,
  onClick,
}) => {
  const subjectAssignments = assignments.filter((a) => a.subjectId === subject.id || a.subjectCode === subject.code);
  const total = subjectAssignments.length;

  const completed = subjectAssignments.filter(
    (a) => progressMap[a.id]?.status === 'completed'
  ).length;

  const inProgress = subjectAssignments.filter(
    (a) => progressMap[a.id]?.status === 'in_progress'
  ).length;

  const remaining = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col justify-between rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] p-5 transition-all duration-200 brutal-shadow hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#0D0D0D] dark:hover:shadow-[6px_6px_0px_0px_#2A2A2A] cursor-pointer"
    >
      <div>
        {/* Top Header: Order Number & Subject Code */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black px-2 py-0.5 rounded-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              #{String(subject.order).padStart(2, '0')}
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {subject.code}
            </span>
          </div>

          <div className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Subject Title */}
        <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-[#F5F5F0] leading-snug tracking-tight font-display">
          {subject.name}
        </h3>

        {subject.description && (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {subject.description}
          </p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between font-mono text-xs mb-2">
          <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {total} {total === 1 ? 'TASK' : 'TASKS'}
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {percentage}% DONE
          </span>
        </div>

        {/* Progress Bar with brutalist square edges */}
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden">
          <div
            className="h-full transition-all duration-500 bg-slate-900 dark:bg-blue-500"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between font-mono text-[11px]">
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            {completed} FINISHED
          </span>
          {remaining > 0 ? (
            <span className="text-amber-800 dark:text-amber-400 font-bold">
              {remaining} REMAINING
            </span>
          ) : (
            <span className="text-slate-400 font-medium">CLEARED</span>
          )}
        </div>
      </div>
    </div>
  );
};
