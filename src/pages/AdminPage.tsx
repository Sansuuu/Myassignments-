import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { AssignmentCard } from '../components/AssignmentCard';
import { AdminAssignmentModal } from '../components/admin/AdminAssignmentModal';
import { AdminStudentList } from '../components/admin/AdminStudentList';
import { AdminAnalyticsView } from '../components/admin/AdminAnalyticsView';
import {
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { Assignment } from '../types';
import { deleteAssignment, toggleAssignmentPublish, duplicateAssignment } from '../services/db';

export const AdminPage: React.FC = () => {
  const {
    assignments,
    subjects,
    studentProgressMap,
    showToast,
  } = useApp();
  const { isAdmin } = useAuth();

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'assignments' | 'students' | 'analytics'>('assignments');
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<Assignment | null>(null);

  const openEditModal = (assignment: Assignment | null) => {
    setAssignmentToEdit(assignment);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setAssignmentToEdit(null);
    setIsEditModalOpen(false);
  };

  const filteredList = assignments.filter((a) => {
    if (adminSearch) {
      const q = adminSearch.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchSubject = a.subjectName.toLowerCase().includes(q) || a.subjectCode.toLowerCase().includes(q);
      if (!matchTitle && !matchSubject) return false;
    }
    if (selectedSubjectFilter !== 'all') {
      if (a.subjectId !== selectedSubjectFilter && a.subjectCode !== selectedSubjectFilter) return false;
    }
    return true;
  });

  const handleDuplicate = async (assignment: Assignment) => {
    try {
      await duplicateAssignment(assignment);
      showToast('Duplicated', 'Created draft copy of assignment.', 'info');
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
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b-2 border-slate-900 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-4 h-4" />
            <span>ROOT CONTROL PANEL // FACULTY DESK</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase text-slate-900 dark:text-[#F5F5F0] tracking-tight font-display mt-1">
            CLASS ADMINISTRATION
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-mono">
            Create coursework, manage 9 CSE subjects, audit student submissions, and view class statistics.
          </p>
        </div>

        <button
          onClick={() => openEditModal(null)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xs border-2 border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-mono text-xs font-bold uppercase hover:bg-blue-600 dark:hover:bg-blue-400 transition-all brutal-shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE NEW ASSIGNMENT</span>
        </button>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex gap-2 border-b-2 border-slate-900 dark:border-slate-800 pb-2 font-mono text-xs font-bold">
        <button
          onClick={() => setActiveAdminSubTab('assignments')}
          className={`px-4 py-2 rounded-xs uppercase tracking-wider transition-all ${
            activeAdminSubTab === 'assignments'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 brutal-shadow-sm'
              : 'bg-white dark:bg-[#121212] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
          }`}
        >
          ASSIGNMENTS ({assignments.length})
        </button>
        <button
          onClick={() => setActiveAdminSubTab('students')}
          className={`px-4 py-2 rounded-xs uppercase tracking-wider transition-all ${
            activeAdminSubTab === 'students'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 brutal-shadow-sm'
              : 'bg-white dark:bg-[#121212] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
          }`}
        >
          STUDENT PROGRESS LOGS
        </button>
        <button
          onClick={() => setActiveAdminSubTab('analytics')}
          className={`px-4 py-2 rounded-xs uppercase tracking-wider transition-all ${
            activeAdminSubTab === 'analytics'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 brutal-shadow-sm'
              : 'bg-white dark:bg-[#121212] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
          }`}
        >
          CLASS ANALYTICS
        </button>
      </div>

      {/* 1. ASSIGNMENTS TAB */}
      {activeAdminSubTab === 'assignments' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] brutal-shadow flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex-1 min-w-[240px]">
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search coursework title or code..."
                className="w-full px-3 py-2 rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white"
              />
            </div>

            <div className="w-64">
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white"
              >
                <option value="all">ALL 9 SUBJECTS</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                progress={studentProgressMap[assignment.id]}
                isAdmin={true}
                onSelect={() => openEditModal(assignment)}
                onStatusChange={() => {}}
                onAskAI={() => {}}
                onEdit={() => openEditModal(assignment)}
                onDelete={() => handleDelete(assignment.id)}
                onDuplicate={() => handleDuplicate(assignment)}
                onTogglePublish={(id, cur) => handleTogglePublish(id, cur)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. STUDENTS TAB */}
      {activeAdminSubTab === 'students' && (
        <AdminStudentList />
      )}

      {/* 3. ANALYTICS TAB */}
      {activeAdminSubTab === 'analytics' && (
        <AdminAnalyticsView />
      )}

      {/* Admin Assignment Create/Edit Modal */}
      <AdminAssignmentModal
        isOpen={isEditModalOpen}
        assignmentToEdit={assignmentToEdit}
        onClose={closeEditModal}
      />
    </div>
  );
};
