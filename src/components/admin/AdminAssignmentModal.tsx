import React, { useState, useEffect } from 'react';
import { Assignment, Subject, Priority } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { createAssignment, updateAssignment, uploadAttachmentFile } from '../../services/db';
import {
  X,
  Plus,
  UploadCloud,
  Paperclip,
  CheckCircle2,
  Calendar,
  Clock,
  UserCheck,
  Link as LinkIcon,
  HelpCircle,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminAssignmentModalProps {
  assignmentToEdit?: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAssignmentModal: React.FC<AdminAssignmentModalProps> = ({
  assignmentToEdit,
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { subjects, showToast } = useApp();

  const [subjectId, setSubjectId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<Priority>('medium');
  const [teacher, setTeacher] = useState('');
  const [instructions, setInstructions] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [published, setPublished] = useState(true);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>(undefined);
  const [attachmentName, setAttachmentName] = useState<string | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assignmentToEdit) {
      setSubjectId(assignmentToEdit.subjectId);
      setTitle(assignmentToEdit.title);
      setDescription(assignmentToEdit.description);
      setDueDate(assignmentToEdit.dueDate);
      setDueTime(assignmentToEdit.dueTime || '23:59');
      setPriority(assignmentToEdit.priority);
      setTeacher(assignmentToEdit.teacher || '');
      setInstructions(assignmentToEdit.instructions || '');
      setExternalUrl(assignmentToEdit.externalUrl || '');
      setPublished(assignmentToEdit.published !== false);
      setAttachmentUrl(assignmentToEdit.attachmentUrl);
      setAttachmentName(assignmentToEdit.attachmentName);
      setSelectedFile(null);
    } else {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const defaultDateStr = nextWeek.toISOString().split('T')[0];

      setSubjectId(subjects[0]?.id || '');
      setTitle('');
      setDescription('');
      setDueDate(defaultDateStr);
      setDueTime('23:59');
      setPriority('medium');
      setTeacher('');
      setInstructions('');
      setExternalUrl('');
      setPublished(true);
      setAttachmentUrl(undefined);
      setAttachmentName(undefined);
      setSelectedFile(null);
    }
    setError(null);
    setUploadProgress(null);
  }, [assignmentToEdit, isOpen, subjects]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an assignment title.');
      return;
    }
    if (!dueDate) {
      setError('Please specify a due date.');
      return;
    }

    const selectedSubject = subjects.find((s) => s.id === subjectId) || subjects[0];
    if (!selectedSubject) {
      setError('Please select a valid subject.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let finalAttachmentUrl = attachmentUrl;
      let finalAttachmentName = attachmentName;
      let finalAttachmentSize: number | undefined = undefined;
      let finalAttachmentType: string | undefined = undefined;

      if (selectedFile) {
        setUploadProgress(10);
        try {
          const uploaded = await uploadAttachmentFile(selectedFile, (progress) => {
            setUploadProgress(progress);
          });
          finalAttachmentUrl = uploaded.url;
          finalAttachmentName = uploaded.name;
          finalAttachmentSize = uploaded.size;
          finalAttachmentType = uploaded.type;
        } catch (uploadErr) {
          console.warn('Storage upload error, fallback to local meta:', uploadErr);
          finalAttachmentName = selectedFile.name;
        }
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        subjectCode: selectedSubject.code,
        dueDate,
        dueTime: dueTime || '23:59',
        priority,
        teacher: teacher.trim() || undefined,
        instructions: instructions.trim() || undefined,
        externalUrl: externalUrl.trim() || undefined,
        published,
        attachmentUrl: finalAttachmentUrl,
        attachmentName: finalAttachmentName,
        attachmentSize: finalAttachmentSize,
        attachmentType: finalAttachmentType,
        createdBy: currentUser?.uid,
      };

      if (assignmentToEdit) {
        await updateAssignment(assignmentToEdit.id, payload);
        showToast('Assignment Updated', 'Changes have been saved and published.', 'success');
      } else {
        await createAssignment(payload);
        showToast('Assignment Created', 'New assignment is now available for students.', 'success');
      }

      onClose();
    } catch (err: any) {
      console.error('Save assignment failed:', err);
      setError(err?.message || 'Failed to save assignment. Please check your admin privileges.');
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto font-sans">
      <div
        className="relative w-full max-w-2xl rounded-xs bg-[#FAFAFA] dark:bg-[#121212] border-2 border-slate-900 dark:border-white brutal-shadow-lg overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#181818]">
          <div>
            <div className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              FACULTY DESK // COURSEWORK EDITOR
            </div>
            <h2 className="text-xl font-black uppercase text-slate-900 dark:text-[#F5F5F0] tracking-tight font-display mt-0.5">
              {assignmentToEdit ? 'EDIT ASSIGNMENT' : 'NEW ASSIGNMENT'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#121212] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-700 dark:text-slate-200 transition-all brutal-shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xs bg-rose-500/10 border-2 border-rose-500 text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
            [ERROR] {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* Subject Selection */}
          <div>
            <label className="block font-mono text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              COURSE SUBJECT <span className="text-rose-500">*</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#181818] text-slate-900 dark:text-white focus:outline-hidden"
              required
            >
              {subjects.map((subj) => (
                <option key={subj.id} value={subj.id}>
                  [{subj.code}] {subj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block font-mono text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              ASSIGNMENT TITLE <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 3 Problem Set: Pointer Arithmetic & Modular Design in C"
              className="w-full px-3.5 py-2.5 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#181818] text-slate-900 dark:text-white focus:outline-hidden"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              DESCRIPTION & OBJECTIVES
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summarize the core requirements, algorithms, or expected derivations..."
              className="w-full px-3.5 py-2.5 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#181818] text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          {/* Dates & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                DUE DATE <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#181818] text-slate-900 dark:text-white focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                DUE TIME
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#181818] text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                PRIORITY
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#181818] text-slate-900 dark:text-white focus:outline-hidden uppercase"
              >
                <option value="high">HIGH PRIORITY</option>
                <option value="medium">MEDIUM PRIORITY</option>
                <option value="low">LOW PRIORITY</option>
              </select>
            </div>
          </div>

          {/* Teacher & External URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                ASSIGNING PROFESSOR / TA
              </label>
              <input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="e.g. Dr. A. Sharma"
                className="w-full px-3.5 py-2 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#181818] text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                SUBMISSION / REFERENCE URL
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://classroom.google.com/..."
                className="w-full px-3.5 py-2 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#181818] text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Detailed Instructions */}
          <div>
            <label className="block font-mono text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              STEP-BY-STEP INSTRUCTIONS & SUBMISSION GUIDELINES
            </label>
            <textarea
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="1. Write clean, modular code with structured comments&#10;2. Include test cases and edge-condition analysis&#10;3. Submit on portal before the due date."
              className="w-full px-3.5 py-2.5 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#181818] text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          {/* File Attachment & PDF URL */}
          <div className="space-y-2">
            <label className="block font-mono text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              ATTACHMENT (PDF / ZIP / DOCX)
            </label>

            <div className="p-3.5 rounded-xs border-2 border-dashed border-slate-400 dark:border-slate-700 bg-white dark:bg-[#181818] space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.zip,.png,.jpg"
                  onChange={handleFileChange}
                  className="text-xs font-mono text-slate-600 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xs file:border-2 file:border-slate-900 dark:file:border-slate-700 file:bg-slate-100 dark:file:bg-slate-800 file:text-xs file:font-mono file:font-bold file:uppercase cursor-pointer"
                />

                {(selectedFile || attachmentName) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setAttachmentUrl(undefined);
                      setAttachmentName(undefined);
                    }}
                    className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 hover:underline uppercase"
                  >
                    Clear File
                  </button>
                )}
              </div>

              {selectedFile && (
                <div className="p-2.5 rounded-xs bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between font-mono text-xs text-blue-900 dark:text-blue-200">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold truncate">{selectedFile.name}</span>
                    <span className="text-[10px] text-slate-500">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <span className="font-bold text-[10px] uppercase bg-blue-600 text-white px-2 py-0.5 rounded-xs">
                    STAGED FOR FAST SAVE
                  </span>
                </div>
              )}

              {attachmentName && !selectedFile && (
                <div className="flex items-center gap-2 font-mono text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-bold">Attached: {attachmentName}</span>
                </div>
              )}

              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    <span>Processing PDF Attachment...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-xs bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-400 dark:border-slate-700">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#181818]">
            <div className="flex items-center gap-2">
              {published ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              <span className="font-mono text-xs font-bold uppercase text-slate-900 dark:text-white">
                PUBLISH STATUS: {published ? 'VISIBLE TO ALL STUDENTS' : 'DRAFT (HIDDEN)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPublished(!published)}
              className={`px-3 py-1.5 rounded-xs border-2 border-slate-900 dark:border-white font-mono text-xs font-bold uppercase transition-all ${
                published
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {published ? 'PUBLISHED' : 'DRAFT'}
            </button>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-900 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#181818] text-slate-700 dark:text-slate-300 font-mono text-xs font-bold uppercase hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xs border-2 border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-mono text-xs font-bold uppercase hover:bg-blue-600 dark:hover:bg-blue-400 transition-all brutal-shadow-sm disabled:opacity-50"
            >
              {saving ? 'SAVING...' : assignmentToEdit ? 'SAVE CHANGES' : 'CREATE ASSIGNMENT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
