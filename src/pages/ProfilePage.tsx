import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  User,
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  LogOut,
  Save,
  Check,
  TrendingUp,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { studentName, updateStudentName, isAdmin, logout, currentUser } = useAuth();
  const { stats, assignments, studentProgressMap, showToast } = useApp();

  const [nameInput, setNameInput] = useState(studentName || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    await updateStudentName(nameInput.trim());
    setIsSaved(true);
    showToast('Name Updated', `Profile name set to "${nameInput.trim()}".`, 'success');
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="pb-4 border-b-2 border-slate-900 dark:border-slate-800">
        <div className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
          ACCOUNT SETTINGS // BTECH 01
        </div>
        <h1 className="text-2xl sm:text-4xl font-black uppercase text-slate-900 dark:text-[#F5F5F0] tracking-tight font-display mt-1">
          STUDENT PROFILE
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-mono">
          Manage your student credentials, progress tracking identity, and session status.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="p-6 sm:p-8 rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] brutal-shadow space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b-2 border-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono font-black text-2xl border-2 border-slate-900 dark:border-white shadow-xs">
              {studentName ? studentName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">
                  {studentName || 'Student Member'}
                </h2>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-xs border-2 border-purple-600 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold uppercase">
                    FACULTY ROOT
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-slate-500 mt-0.5">
                BTech CSE 1st Semester • {currentUser?.email || 'Local Student Session'}
              </p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xs border-2 border-rose-600 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-mono text-xs font-bold uppercase hover:bg-rose-600 hover:text-white transition-all brutal-shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>SIGN OUT</span>
          </button>
        </div>

        {/* Change Display Name */}
        <form onSubmit={handleSaveName} className="space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold uppercase text-slate-900 dark:text-slate-200 tracking-wider mb-2">
              DISPLAY NAME / ROLL NO TAG
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Alex Sharma (CSE-042)"
                className="flex-1 px-3.5 py-2 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white focus:outline-hidden"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xs border-2 border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono text-xs font-bold uppercase hover:bg-blue-600 dark:hover:bg-blue-400 transition-all brutal-shadow-sm"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? 'SAVED' : 'SAVE NAME'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Personal Academic Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] brutal-shadow">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-500 uppercase">COMPLETION RATE</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black font-display text-slate-900 dark:text-white mt-2">
            {stats.completionRate}%
          </div>
          <p className="font-mono text-[10px] text-slate-500 mt-1 uppercase">
            {stats.completed} of {stats.total} assignments verified
          </p>
        </div>

        <div className="p-5 rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] brutal-shadow">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-500 uppercase">IN PROGRESS</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black font-display text-slate-900 dark:text-white mt-2">
            {stats.inProgress}
          </div>
          <p className="font-mono text-[10px] text-slate-500 mt-1 uppercase">
            Actively being worked on
          </p>
        </div>

        <div className="p-5 rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] brutal-shadow">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-500 uppercase">OVERDUE COUNT</span>
            <Award className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black font-display text-slate-900 dark:text-white mt-2">
            {stats.overdue}
          </div>
          <p className="font-mono text-[10px] text-slate-500 mt-1 uppercase">
            {stats.overdue === 0 ? 'All deadlines clear' : 'Requires immediate attention'}
          </p>
        </div>
      </div>
    </div>
  );
};
