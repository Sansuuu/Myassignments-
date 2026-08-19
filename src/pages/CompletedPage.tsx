import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { AssignmentCard } from '../components/AssignmentCard';
import { CheckCircle2, Trophy, RotateCcw } from 'lucide-react';
import { Assignment } from '../types';
import { deleteAssignment, toggleAssignmentPublish, duplicateAssignment } from '../services/db';

export const CompletedPage: React.FC = () => {
  const {
    assignments,
    studentProgressMap,
    setSelectedAssignment,
    openAITutorWithAssignment,
    setActiveTab,
    markStatus,
    stats,
    showToast,
  } = useApp();
  const { isAdmin } = useAuth();

  const completedAssignments = assignments.filter(
    (a) => studentProgressMap[a.id]?.status === 'completed'
  );

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
        <div className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>VERIFIED ACHIEVEMENTS // COMPLETED</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black uppercase text-slate-900 dark:text-[#F5F5F0] tracking-tight font-display mt-1">
          FINISHED TASKS ({completedAssignments.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-mono">
          All completed and submitted coursework records.
        </p>
      </div>

      {/* Progress Achievement Banner */}
      <div className="p-6 rounded-md border-2 border-emerald-600/60 dark:border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20 brutal-shadow flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xs bg-emerald-600 text-white font-black text-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-mono text-base font-bold text-slate-900 dark:text-white uppercase">
              {stats.completionRate}% SEMESTER COURSEWORK CLEARED
            </h3>
            <p className="font-mono text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {completedAssignments.length} done • {stats.remaining} remaining
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('dashboard')}
          className="px-4 py-2 rounded-xs border-2 border-slate-900 dark:border-white bg-white dark:bg-[#121212] font-mono text-xs font-bold uppercase text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all brutal-shadow-sm"
        >
          VIEW REMAINING TASKS ({stats.remaining})
        </button>
      </div>

      {/* List */}
      {completedAssignments.length === 0 ? (
        <div className="p-12 text-center rounded-md border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#121212]">
          <RotateCcw className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <h3 className="font-mono text-base font-bold text-slate-900 dark:text-white uppercase">
            NO COMPLETED TASKS YET
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Check off assignments from the Dashboard or Today page when submitted.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedAssignments.map((assignment) => (
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
    </div>
  );
};
