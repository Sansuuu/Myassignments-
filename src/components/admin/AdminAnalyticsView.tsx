import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../StatCard';
import {
  BarChart3,
  CheckCircle2,
  BookOpen,
  Users,
  TrendingUp,
} from 'lucide-react';
import { getDeadlineInfo } from '../../utils/dateUtils';

export const AdminAnalyticsView: React.FC = () => {
  const { assignments, subjects, allProgressList } = useApp();

  const publishedAssignments = assignments.filter((a) => a.published);
  const totalPublished = publishedAssignments.length;

  // Compute unique student IDs
  const uniqueStudents = Array.from(new Set(allProgressList.map((p) => p.userId)));
  const totalStudentsCount = Math.max(1, uniqueStudents.length);

  // Overall class completion
  const totalCompletedSubmissions = allProgressList.filter((p) => p.status === 'completed').length;
  const totalPossibleSubmissions = totalPublished * totalStudentsCount;
  const classAvgCompletion =
    totalPossibleSubmissions > 0
      ? Math.round((totalCompletedSubmissions / totalPossibleSubmissions) * 100)
      : 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="CLASS AVG COMPLETION"
          value={`${classAvgCompletion}%`}
          subtitle="Across all published assignments"
          icon={TrendingUp}
          color="#3B82F6"
        />

        <StatCard
          title="ACTIVE STUDENTS"
          value={uniqueStudents.length}
          subtitle="Registered in Class Hub"
          icon={Users}
          color="#8B5CF6"
        />

        <StatCard
          title="TOTAL ASSIGNMENTS"
          value={totalPublished}
          subtitle={`${assignments.length - totalPublished} drafts`}
          icon={BookOpen}
          color="#10B981"
        />

        <StatCard
          title="COMPLETED SUBMISSIONS"
          value={totalCompletedSubmissions}
          subtitle="Total verified tasks done"
          icon={CheckCircle2}
          color="#F59E0B"
        />
      </div>

      {/* Per Assignment Breakdown */}
      <div className="rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] p-6 brutal-shadow">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-900 dark:border-slate-800">
          <div>
            <div className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              AGGREGATED METRICS
            </div>
            <h3 className="text-lg font-black uppercase text-slate-900 dark:text-[#F5F5F0] tracking-tight font-display mt-0.5 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              PER-ASSIGNMENT COMPLETION DISTRIBUTION
            </h3>
            <p className="font-mono text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Coursework completion rates across all enrolled student accounts
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {publishedAssignments.length === 0 ? (
            <p className="font-mono text-xs text-slate-400 text-center py-6">
              No published assignments created yet.
            </p>
          ) : (
            publishedAssignments.map((assign) => {
              const records = allProgressList.filter((p) => p.assignmentId === assign.id);
              const doneCount = records.filter((p) => p.status === 'completed').length;
              const inProgressCount = records.filter((p) => p.status === 'in_progress').length;
              const notStartedCount = Math.max(0, totalStudentsCount - doneCount - inProgressCount);

              const donePercent = Math.round((doneCount / totalStudentsCount) * 100);
              const inProgressPercent = Math.round((inProgressCount / totalStudentsCount) * 100);
              const notStartedPercent = Math.max(0, 100 - donePercent - inProgressPercent);

              const deadline = getDeadlineInfo(assign.dueDate, assign.dueTime);

              return (
                <div
                  key={assign.id}
                  className="p-4 rounded-xs border-2 border-slate-900 dark:border-slate-800 bg-slate-50 dark:bg-[#181818] font-mono text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-xs border border-slate-900 dark:border-white font-bold bg-white dark:bg-black text-[10px] text-slate-900 dark:text-white uppercase">
                        {assign.subjectCode}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white font-sans text-sm">
                        {assign.title}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-bold uppercase">
                      DUE: {deadline.relativeText}
                    </div>
                  </div>

                  {/* Segmented Progress Bar */}
                  <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-700 rounded-xs overflow-hidden border border-slate-900 dark:border-slate-600 flex mb-2">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${donePercent}%` }}
                      title={`Completed: ${doneCount} (${donePercent}%)`}
                    />
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${inProgressPercent}%` }}
                      title={`In Progress: ${inProgressCount} (${inProgressPercent}%)`}
                    />
                    <div
                      className="h-full bg-slate-300 dark:bg-slate-800 transition-all"
                      style={{ width: `${notStartedPercent}%` }}
                      title={`Not Started: ${notStartedCount} (${notStartedPercent}%)`}
                    />
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-xs bg-emerald-500" />
                      COMPLETED: {doneCount} ({donePercent}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-xs bg-amber-500" />
                      IN PROGRESS: {inProgressCount} ({inProgressPercent}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-xs bg-slate-400" />
                      NOT STARTED: {notStartedCount} ({notStartedPercent}%)
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
