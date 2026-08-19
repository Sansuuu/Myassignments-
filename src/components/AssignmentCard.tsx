import React from 'react';
import {
  Assignment,
  AssignmentStatus,
  StudentProgress,
} from '../types';
import { DeadlineBadge } from './DeadlineBadge';
import { PriorityBadge } from './PriorityBadge';
import {
  Sparkles,
  Cpu,
  Paperclip,
  ExternalLink,
  UserCheck,
  Check,
  Play,
  RotateCcw,
  Copy,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowUpRight,
} from 'lucide-react';
import { buildAssignmentPrompt, launchInChatGPT, launchInGemini } from '../utils/aiLaunch';
import { useApp } from '../context/AppContext';

interface AssignmentCardProps {
  assignment: Assignment;
  progress?: StudentProgress;
  isAdmin?: boolean;
  onSelect: (assignment: Assignment) => void;
  onStatusChange: (status: AssignmentStatus) => void;
  onAskAI?: (assignment: Assignment) => void;
  onEdit?: (assignment: Assignment) => void;
  onDelete?: (assignmentId: string) => void;
  onDuplicate?: (assignment: Assignment) => void;
  onTogglePublish?: (assignmentId: string, current: boolean) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  progress,
  isAdmin = false,
  onSelect,
  onStatusChange,
  onEdit,
  onDelete,
  onDuplicate,
  onTogglePublish,
}) => {
  const { showToast } = useApp();
  const currentStatus = progress?.status || 'not_started';
  const isCompleted = currentStatus === 'completed';
  const isInProgress = currentStatus === 'in_progress';

  const handleLaunchGemini = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prompt = buildAssignmentPrompt(assignment);
    launchInGemini(prompt, (msg, type) => showToast(msg, undefined, type));
  };

  const handleLaunchChatGPT = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prompt = buildAssignmentPrompt(assignment);
    launchInChatGPT(prompt, (msg, type) => showToast(msg, undefined, type));
  };

  return (
    <div
      onClick={() => onSelect(assignment)}
      className={`group relative flex flex-col justify-between rounded-md border-2 bg-white dark:bg-[#121212] p-5 transition-all duration-200 cursor-pointer brutal-shadow hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#0D0D0D] dark:hover:shadow-[6px_6px_0px_0px_#2A2A2A] ${
        isCompleted
          ? 'border-emerald-600/60 dark:border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/10'
          : isInProgress
          ? 'border-blue-600/60 dark:border-blue-500/50 bg-blue-500/5 dark:bg-blue-950/10'
          : 'border-slate-900 dark:border-slate-800'
      }`}
    >
      <div>
        {/* Top Header: Monospace Subject Code, Status Pill, Priority & Deadline */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-xs bg-slate-900 text-white dark:bg-white dark:text-slate-950">
              {assignment.subjectCode}
            </span>

            {!assignment.published && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-xs bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                <EyeOff className="w-3 h-3" />
                DRAFT
              </span>
            )}

            <PriorityBadge priority={assignment.priority} />
          </div>

          <DeadlineBadge
            dueDate={assignment.dueDate}
            dueTime={assignment.dueTime}
            isCompleted={isCompleted}
          />
        </div>

        {/* Subject Name */}
        <div className="mt-3 font-mono text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
          {assignment.subjectName}
        </div>

        {/* Title */}
        <h3
          className={`mt-1 text-base sm:text-lg font-bold leading-snug tracking-tight ${
            isCompleted
              ? 'text-slate-400 dark:text-slate-500 line-through'
              : 'text-slate-900 dark:text-[#F5F5F0]'
          }`}
        >
          {assignment.title}
        </h3>

        {/* Description Snippet */}
        {assignment.description && (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-normal">
            {assignment.description}
          </p>
        )}

        {/* Metadata Footer: Instructor & Attachments */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
          {assignment.teacher && (
            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-xs border border-slate-200 dark:border-slate-700 text-[11px]">
              <UserCheck className="w-3 h-3 text-slate-400" />
              <span>{assignment.teacher}</span>
            </span>
          )}

          {assignment.attachmentUrl && (
            <a
              href={assignment.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-xs border border-blue-200 dark:border-blue-900/40"
              title="Download assignment attachment"
            >
              <Paperclip className="w-3 h-3" />
              <span>{assignment.attachmentName || 'Attachment'}</span>
              <ArrowUpRight className="w-2.5 h-2.5" />
            </a>
          )}

          {assignment.externalUrl && (
            <a
              href={assignment.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 hover:underline bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-xs border border-slate-200 dark:border-slate-700"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Reference Link</span>
            </a>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        {/* Status Action Buttons */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isCompleted ? (
            <button
              onClick={() => onStatusChange('not_started')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
              title="Reset status"
            >
              <RotateCcw className="w-3 h-3" />
              <span>UNDO</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => onStatusChange('completed')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all brutal-shadow-sm hover:translate-y-px"
              >
                <Check className="w-3.5 h-3.5" />
                <span>COMPLETE</span>
              </button>

              {isInProgress ? (
                <button
                  onClick={() => onStatusChange('not_started')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold uppercase rounded-xs bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>IN PROGRESS</span>
                </button>
              ) : (
                <button
                  onClick={() => onStatusChange('in_progress')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold uppercase rounded-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  <span>START</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* AI Launchers & Admin Actions */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleLaunchGemini}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-mono font-bold uppercase rounded-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 transition-colors"
            title="Copy prompt & open in Google Gemini"
          >
            <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>GEMINI</span>
          </button>

          <button
            onClick={handleLaunchChatGPT}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-mono font-bold uppercase rounded-xs bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors"
            title="Pre-fill & open in OpenAI ChatGPT"
          >
            <Cpu className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>GPT</span>
          </button>

          {isAdmin && (
            <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200 dark:border-slate-800">
              {onTogglePublish && (
                <button
                  onClick={() => onTogglePublish(assignment.id, assignment.published)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={assignment.published ? 'Unpublish' : 'Publish'}
                >
                  {assignment.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                </button>
              )}
              {onDuplicate && (
                <button
                  onClick={() => onDuplicate(assignment)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Duplicate assignment"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(assignment)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 rounded-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Edit assignment"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(assignment.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Delete assignment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
