import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { CLASS_NAME } from '../utils/constants';
import {
  GraduationCap,
  Search,
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  AlertCircle,
  Menu,
  X,
  SlidersHorizontal,
  Terminal,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { studentName, role, isAdmin, logout } = useAuth();
  const { filters, setFilters, stats, setActiveTab, activeTab } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-slate-900 dark:border-slate-800 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Mobile Menu Toggle & Class Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xs border border-slate-900 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono font-black text-xs border border-slate-900 dark:border-white shadow-xs">
                CSE
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-[#F5F5F0] font-display">
                    {CLASS_NAME}
                  </h1>
                  <span className="font-mono px-1.5 py-0.2 rounded-xs text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                    BTECH 01
                  </span>
                </div>
                <p className="hidden md:block font-mono text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                  ACADEMIC PORTAL // ASSIGNMENT HUB
                </p>
              </div>
            </div>
          </div>

          {/* Middle: Global Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filters.searchQuery || ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                }
                placeholder="Search assignments, subject code (e.g. 25B17CIT72)..."
                className="w-full pl-10 pr-4 py-2 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-0 focus:border-blue-600 transition-all"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Quick Urgent Badge, User Profile & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Overdue/Due Alert Pill */}
            {(stats.overdue > 0 || stats.dueToday > 0) && (
              <button
                onClick={() => setActiveTab('today')}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-xs bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-600 dark:border-rose-500 hover:bg-rose-500/25 transition-colors"
                title="Click to view assignments due today or overdue"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {stats.overdue > 0 ? `${stats.overdue} OVERDUE` : `${stats.dueToday} DUE TODAY`}
                </span>
              </button>
            )}

            {/* AI Tutor Quick Access */}
            <button
              onClick={() => setActiveTab('ai-tutor')}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-xs transition-all ${
                activeTab === 'ai-tutor'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 brutal-shadow-sm'
                  : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>AI TUTOR</span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1 rounded-xs border-2 border-slate-900 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono font-bold text-xs">
                  {studentName ? studentName.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="hidden lg:block text-left pr-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight font-mono">
                    {studentName || 'Student'}
                  </p>
                  <p className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                    {isAdmin ? 'ADMIN' : 'STUDENT'}
                  </p>
                </div>
              </button>

              {/* User Menu Modal / Popover */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-60 rounded-md border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#121212] p-2 brutal-shadow z-50 animate-in fade-in zoom-in-95">
                    <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 font-mono">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {studentName || 'Class Member'}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase mt-0.5">
                        {isAdmin ? 'Class Administrator' : 'BTech 1st Sem CSE'}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        MY PROFILE
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setActiveTab('admin');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          ADMIN CONTROL
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        SIGN OUT
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              placeholder="Search assignments..."
              className="w-full pl-9 pr-4 py-2 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
