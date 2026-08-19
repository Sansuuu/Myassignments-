import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { AssignmentCard } from '../components/AssignmentCard';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  Filter,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { Assignment } from '../types';
import { deleteAssignment, toggleAssignmentPublish, duplicateAssignment } from '../services/db';

export const DashboardPage: React.FC = () => {
  const { studentName, isAdmin } = useAuth();
  const {
    assignments,
    subjects,
    studentProgressMap,
    stats,
    filters,
    setFilters,
    resetFilters,
    markStatus,
    setSelectedAssignment,
    openAITutorWithAssignment,
    setActiveTab,
    showToast,
  } = useApp();

  // Filter & Search logic
  const filteredAssignments = assignments.filter((a) => {
    // Admin draft filter
    if (!a.published && !isAdmin) return false;

    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchDesc = a.description.toLowerCase().includes(q);
      const matchSubject = a.subjectName.toLowerCase().includes(q) || a.subjectCode.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSubject) return false;
    }

    // Subject filter
    if (filters.subjectId && filters.subjectId !== 'all') {
      if (a.subjectId !== filters.subjectId && a.subjectCode !== filters.subjectId) return false;
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      if (a.priority !== filters.priority) return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      const p = studentProgressMap[a.id];
      const currentStatus = p?.status || 'not_started';
      if (currentStatus !== filters.status) return false;
    }

    return true;
  });

  const handleDuplicate = async (assignment: Assignment) => {
    try {
      await duplicateAssignment(assignment);
      showToast('Assignment Duplicated', 'Created draft copy in assignment directory.', 'info');
    } catch {
      showToast('Error', 'Could not duplicate assignment.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(id);
      showToast('Assignment Deleted', 'Removed from academic database.', 'info');
    } catch {
      showToast('Error', 'Could not delete assignment.', 'error');
    }
  };

  const handleTogglePublish = async (id: string, cur: boolean) => {
    try {
      await toggleAssignmentPublish(id, cur);
      showToast(cur ? 'Assignment Hidden' : 'Assignment Published', '', 'info');
    } catch {
      showToast('Error', 'Could not toggle publish state.', 'error');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b-2 border-slate-900 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Sparkles className="w-4 h-4" />
            <span>CSE CLASS OVERVIEW // SEMESTER 01</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase text-slate-900 dark:text-[#F5F5F0] tracking-tight font-display mt-1">
            ACADEMIC DASHBOARD
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-mono">
            Welcome back, <span className="font-bold text-slate-900 dark:text-white">{studentName || 'Student'}</span>. Track all 9 CSE subjects, track deadlines, and study with AI.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#121212] brutal-shadow-sm font-bold uppercase">
            ACTIVE SESSION: {isAdmin ? 'FACULTY ROOT' : 'STUDENT'}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="COMPLETION RATE"
          value={`${stats.completionRate}%`}
          subtitle={`${stats.completed} of ${stats.total} tasks finished`}
          icon={TrendingUp}
          color="#3B82F6"
        />

        <StatCard
          title="OVERDUE TASKS"
          value={stats.overdue}
          subtitle={stats.overdue > 0 ? 'Urgent action required' : 'All deadlines clear'}
          icon={AlertTriangle}
          color="#EF4444"
          onClick={() => setFilters((prev) => ({ ...prev, deadlineFilter: 'overdue' }))}
        />

        <StatCard
          title="DUE TODAY"
          value={stats.dueToday}
          subtitle="Tasks ending before midnight"
          icon={Clock}
          color="#F59E0B"
          onClick={() => setActiveTab('today')}
        />

        <StatCard
          title="IN PROGRESS"
          value={stats.inProgress}
          subtitle="Currently underway"
          icon={Layers}
          color="#F59E0B"
          onClick={() => setFilters((prev) => ({ ...prev, status: 'in_progress' }))}
        />
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] brutal-shadow space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" />
            ASSIGNMENT FILTERS
          </span>

          {(filters.subjectId !== 'all' || filters.priority !== 'all' || filters.status !== 'all' || filters.searchQuery) && (
            <button
              onClick={() => resetFilters()}
              className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              [RESET ALL FILTERS]
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          {/* Subject selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Course / Subject
            </label>
            <select
              value={filters.subjectId || 'all'}
              onChange={(e) => setFilters((prev) => ({ ...prev, subjectId: e.target.value }))}
              className="w-full px-3 py-2 rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white"
            >
              <option value="all">ALL 9 CSE COURSES</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Urgency / Priority
            </label>
            <select
              value={filters.priority || 'all'}
              onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value as any }))}
              className="w-full px-3 py-2 rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white"
            >
              <option value="all">ALL PRIORITIES</option>
              <option value="high">HIGH PRIORITY</option>
              <option value="medium">MEDIUM PRIORITY</option>
              <option value="low">LOW PRIORITY</option>
            </select>
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Progress Status
            </label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white"
            >
              <option value="all">ALL STATUSES</option>
              <option value="not_started">NOT STARTED</option>
              <option value="in_progress">IN PROGRESS</option>
              <option value="completed">COMPLETED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignment List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            SHOWING {filteredAssignments.length} OF {assignments.length} ASSIGNMENTS
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="p-12 text-center rounded-md border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#121212]">
            <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <h3 className="font-mono text-base font-bold text-slate-900 dark:text-white uppercase">
              NO ASSIGNMENTS FOUND
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Try adjusting your search criteria or clear active filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                progress={studentProgressMap[assignment.id]}
                isAdmin={isAdmin}
                onSelect={(a) => setSelectedAssignment(a)}
                onStatusChange={(status) => markStatus(assignment.id, assignment.subjectId, status)}
                onAskAI={(a) => openAITutorWithAssignment(a)}
                onEdit={isAdmin ? () => { setActiveTab('admin'); } : undefined}
                onDelete={isAdmin ? () => handleDelete(assignment.id) : undefined}
                onDuplicate={isAdmin ? () => handleDuplicate(assignment) : undefined}
                onTogglePublish={isAdmin ? (id, cur) => handleTogglePublish(id, cur) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
