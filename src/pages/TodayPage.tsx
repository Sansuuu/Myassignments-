import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { AssignmentCard } from '../components/AssignmentCard';
import { getDeadlineInfo } from '../utils/dateUtils';
import { Assignment } from '../types';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { deleteAssignment, toggleAssignmentPublish, duplicateAssignment } from '../services/db';

export const TodayPage: React.FC = () => {
  const {
    assignments,
    studentProgressMap,
    setSelectedAssignment,
    openAITutorWithAssignment,
    setActiveTab,
    markStatus,
    showToast,
  } = useApp();
  const { isAdmin } = useAuth();

  const overdueList: Assignment[] = [];
  const dueTodayList: Assignment[] = [];
  const dueTomorrowList: Assignment[] = [];
  const upcomingList: Assignment[] = [];

  assignments.forEach((a) => {
    if (!a.published && !isAdmin) return;
    const isCompleted = studentProgressMap[a.id]?.status === 'completed';
    const info = getDeadlineInfo(a.dueDate, a.dueTime);

    if (info.isOverdue && !isCompleted) {
      overdueList.push(a);
    } else if (info.isDueToday && !isCompleted) {
      dueTodayList.push(a);
    } else if (info.isDueTomorrow && !isCompleted) {
      dueTomorrowList.push(a);
    } else {
      upcomingList.push(a);
    }
  });

  const handleDuplicate = async (assignment: Assignment) => {
    try {
      await duplicateAssignment(assignment);
      showToast('Assignment Duplicated', 'Created draft copy.', 'info');
    } catch {
      showToast('Error', 'Could not duplicate assignment.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(id);
      showToast('Assignment Deleted', 'Removed from records.', 'info');
    } catch {
      showToast('Error', 'Could not delete assignment.', 'error');
    }
  };

  const handleTogglePublish = async (id: string, cur: boolean) => {
    try {
      await toggleAssignmentPublish(id, cur);
      showToast(cur ? 'Assignment Hidden' : 'Assignment Published', '', 'info');
    } catch {
      showToast('Error', 'Could not toggle publish status.', 'error');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="pb-4 border-b-2 border-slate-900 dark:border-slate-800">
        <div className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
          DAILY SCHEDULE // FOCUS VIEW
        </div>
        <h1 className="text-2xl sm:text-4xl font-black uppercase text-slate-900 dark:text-[#F5F5F0] tracking-tight font-display mt-1">
          TODAY & UPCOMING DEADLINES
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-mono">
          Chronological breakdown of coursework categorized by immediacy.
        </p>
      </div>

      {/* 1. OVERDUE SECTION (If Any) */}
      {overdueList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>OVERDUE DEADLINES ({overdueList.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdueList.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                progress={studentProgressMap[assignment.id]}
                isAdmin={isAdmin}
                onSelect={(a) => setSelectedAssignment(a)}
                onStatusChange={(status) => markStatus(assignment.id, assignment.subjectId, status)}
                onAskAI={(a) => openAITutorWithAssignment(a)}
                onEdit={isAdmin ? () => setActiveTab('admin') : undefined}
                onDelete={isAdmin ? () => handleDelete(assignment.id) : undefined}
                onDuplicate={isAdmin ? () => handleDuplicate(assignment) : undefined}
                onTogglePublish={isAdmin ? (id, cur) => handleTogglePublish(id, cur) : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. DUE TODAY */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>DUE TODAY ({dueTodayList.length})</span>
        </div>

        {dueTodayList.length === 0 ? (
          <div className="p-8 text-center rounded-md border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#121212]">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
            <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
              NO TASKS DUE TODAY
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueTodayList.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                progress={studentProgressMap[assignment.id]}
                isAdmin={isAdmin}
                onSelect={(a) => setSelectedAssignment(a)}
                onStatusChange={(status) => markStatus(assignment.id, assignment.subjectId, status)}
                onAskAI={(a) => openAITutorWithAssignment(a)}
                onEdit={isAdmin ? () => setActiveTab('admin') : undefined}
                onDelete={isAdmin ? () => handleDelete(assignment.id) : undefined}
                onDuplicate={isAdmin ? () => handleDuplicate(assignment) : undefined}
                onTogglePublish={isAdmin ? (id, cur) => handleTogglePublish(id, cur) : undefined}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. DUE TOMORROW */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          <Calendar className="w-4 h-4" />
          <span>DUE TOMORROW ({dueTomorrowList.length})</span>
        </div>

        {dueTomorrowList.length === 0 ? (
          <div className="p-8 text-center rounded-md border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#121212]">
            <p className="font-mono text-xs text-slate-500 uppercase">
              No tasks due tomorrow.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueTomorrowList.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                progress={studentProgressMap[assignment.id]}
                isAdmin={isAdmin}
                onSelect={(a) => setSelectedAssignment(a)}
                onStatusChange={(status) => markStatus(assignment.id, assignment.subjectId, status)}
                onAskAI={(a) => openAITutorWithAssignment(a)}
                onEdit={isAdmin ? () => setActiveTab('admin') : undefined}
                onDelete={isAdmin ? () => handleDelete(assignment.id) : undefined}
                onDuplicate={isAdmin ? () => handleDuplicate(assignment) : undefined}
                onTogglePublish={isAdmin ? (id, cur) => handleTogglePublish(id, cur) : undefined}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. UPCOMING / LATER */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>UPCOMING COURSEWORK ({upcomingList.length})</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingList.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              progress={studentProgressMap[assignment.id]}
              isAdmin={isAdmin}
              onSelect={(a) => setSelectedAssignment(a)}
              onStatusChange={(status) => markStatus(assignment.id, assignment.subjectId, status)}
              onAskAI={(a) => openAITutorWithAssignment(a)}
              onEdit={isAdmin ? () => setActiveTab('admin') : undefined}
              onDelete={isAdmin ? () => handleDelete(assignment.id) : undefined}
              onDuplicate={isAdmin ? () => handleDuplicate(assignment) : undefined}
              onTogglePublish={isAdmin ? (id, cur) => handleTogglePublish(id, cur) : undefined}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
