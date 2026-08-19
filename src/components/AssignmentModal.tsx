import React from 'react';
import { Assignment, AssignmentStatus, StudentProgress } from '../types';
import { DeadlineBadge } from './DeadlineBadge';
import { PriorityBadge } from './PriorityBadge';
import {
  X,
  Bot,
  Paperclip,
  ExternalLink,
  UserCheck,
  Calendar,
  CheckCircle2,
  Play,
  RotateCcw,
  FileText,
  HelpCircle,
  Download,
  Clock,
  Sparkles,
} from 'lucide-react';

interface AssignmentModalProps {
  assignment: Assignment | null;
  progress?: StudentProgress;
  onClose: () => void;
  onStatusChange: (status: AssignmentStatus) => void;
  onAskAI: (assignment: Assignment) => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  assignment,
  progress,
  onClose,
  onStatusChange,
  onAskAI,
}) => {
  if (!assignment) return null;

  const currentStatus = progress?.status || 'not_started';
  const isCompleted = currentStatus === 'completed';
  const isInProgress = currentStatus === 'in_progress';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl rounded-md bg-white dark:bg-[#121212] border-2 border-slate-900 dark:border-slate-700 brutal-shadow-lg overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b-2 border-slate-900 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0A0A]">
          <div className="pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                {assignment.subjectCode}
              </span>
              <PriorityBadge priority={assignment.priority} size="md" />
              <DeadlineBadge
                dueDate={assignment.dueDate}
                dueTime={assignment.dueTime}
                isCompleted={isCompleted}
              />
            </div>
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {assignment.subjectName}
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F5F5F0] leading-snug tracking-tight font-display">
              {assignment.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xs p-1.5 border border-slate-900 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto font-sans">
          {/* Metadata banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xs bg-slate-50 dark:bg-[#181818] border border-slate-300 dark:border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-500">DEADLINE: </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {assignment.dueDate} [{assignment.dueTime || '23:59'}]
                </span>
              </div>
            </div>

            {assignment.teacher && (
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-500">FACULTY: </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {assignment.teacher}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Assignment Details & Problem Statement
            </h3>
            <div className="p-4 rounded-xs bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {assignment.description || 'No description provided.'}
            </div>
          </div>

          {/* Specific Guidelines / Instructions */}
          {assignment.instructions && (
            <div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Submission Guidelines & Lab Rules
              </h3>
              <div className="p-4 rounded-xs bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs sm:text-sm text-blue-900 dark:text-blue-200 whitespace-pre-wrap leading-relaxed font-mono">
                {assignment.instructions}
              </div>
            </div>
          )}

          {/* Attachments & Resources */}
          {(assignment.attachmentUrl || assignment.externalUrl) && (
            <div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Attached Files & External References
              </h3>
              <div className="flex flex-wrap gap-3">
                {assignment.attachmentUrl && (
                  <a
                    href={assignment.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 p-3 rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#181818] font-mono text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all brutal-shadow-sm"
                  >
                    <Paperclip className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Download {assignment.attachmentName || 'Attachment File'}</span>
                  </a>
                )}

                {assignment.externalUrl && (
                  <a
                    href={assignment.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 p-3 rounded-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] font-mono text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Reference Resource</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-6 border-t-2 border-slate-900 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0A0A] flex flex-wrap items-center justify-between gap-3">
          {/* Status buttons */}
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <button
                onClick={() => onStatusChange('not_started')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase rounded-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mark As Incomplete</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => onStatusChange('completed')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase rounded-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all brutal-shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Completed</span>
                </button>

                {isInProgress ? (
                  <button
                    onClick={() => onStatusChange('not_started')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold uppercase rounded-xs bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>In Progress</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onStatusChange('in_progress')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold uppercase rounded-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Work</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* AI Tutor Launcher */}
          <button
            onClick={() => onAskAI(assignment)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase rounded-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-all brutal-shadow-sm hover:translate-y-px"
          >
            <Sparkles className="w-4 h-4 text-blue-400 dark:text-blue-600" />
            <span>Consult CSE AI Tutor →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
