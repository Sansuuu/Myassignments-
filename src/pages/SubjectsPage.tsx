import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { SubjectCard } from '../components/SubjectCard';
import { AssignmentCard } from '../components/AssignmentCard';
import { Subject, Assignment } from '../types';
import { BookOpen, ArrowLeft, Plus } from 'lucide-react';
import { deleteAssignment, toggleAssignmentPublish, duplicateAssignment } from '../services/db';

export const SubjectsPage: React.FC = () => {
  const {
    subjects,
    assignments,
    studentProgressMap,
    setSelectedAssignment,
    openAITutorWithAssignment,
    setActiveTab,
    markStatus,
    showToast,
  } = useApp();
  const { isAdmin } = useAuth();

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const subjectAssignments = selectedSubject
    ? assignments.filter(
        (a) =>
          a.subjectId === selectedSubject.id || a.subjectCode === selectedSubject.code
      )
    : [];

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
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b-2 border-slate-900 dark:border-slate-800">
        <div>
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
            CSE CURRICULUM // 9 CORE MODULES
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase text-slate-900 dark:text-[#F5F5F0] tracking-tight font-display mt-1">
            {selectedSubject ? `${selectedSubject.name}` : 'ALL 9 SUBJECTS'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-mono">
            {selectedSubject
              ? `Course Code: ${selectedSubject.code} — ${selectedSubject.description || ''}`
              : 'Browse structured coursework, lab files, and problems per subject.'}
          </p>
        </div>

        {selectedSubject && (
          <button
            onClick={() => setSelectedSubject(null)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#181818] font-mono text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all brutal-shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO ALL COURSES</span>
          </button>
        )}
      </div>

      {!selectedSubject ? (
        /* Subject Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              assignments={assignments}
              progressMap={studentProgressMap}
              onClick={() => setSelectedSubject(subject)}
            />
          ))}
        </div>
      ) : (
        /* Subject-Specific Assignments */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
              {subjectAssignments.length} COURSEWORK TASKS ENROLLED
            </div>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border-2 border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-mono text-xs font-bold uppercase hover:bg-blue-600 dark:hover:bg-blue-400 transition-all brutal-shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD TO THIS COURSE</span>
              </button>
            )}
          </div>

          {subjectAssignments.length === 0 ? (
            <div className="p-12 text-center rounded-md border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#121212]">
              <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <h3 className="font-mono text-base font-bold text-slate-900 dark:text-white uppercase">
                NO ASSIGNMENTS FOR THIS COURSE YET
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Faculty has not added tasks for this subject yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectAssignments.map((assignment) => (
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
      )}
    </div>
  );
};
