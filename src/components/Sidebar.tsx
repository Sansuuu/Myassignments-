import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Clock,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  User,
  Terminal,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, stats } = useApp();
  const { isAdmin } = useAuth();

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'OVERVIEW',
      icon: LayoutDashboard,
      badge: stats.remaining > 0 ? stats.remaining : undefined,
      badgeColor: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
    },
    {
      id: 'today',
      label: 'URGENT & TODAY',
      icon: Clock,
      badge: stats.overdue + stats.dueToday > 0 ? stats.overdue + stats.dueToday : undefined,
      badgeColor: stats.overdue > 0 ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white',
    },
    {
      id: 'subjects',
      label: '9 SUBJECTS',
      icon: BookOpen,
    },
    {
      id: 'calendar',
      label: 'CALENDAR',
      icon: CalendarDays,
    },
    {
      id: 'ai-launch',
      label: 'AI LAUNCHPAD',
      icon: Sparkles,
      badge: 'LAUNCH',
      badgeColor: 'bg-blue-600 text-white font-bold',
    },
    {
      id: 'completed',
      label: 'COMPLETED',
      icon: CheckCircle2,
      badge: stats.completed > 0 ? stats.completed : undefined,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'profile',
      label: 'PROFILE',
      icon: User,
    },
  ];

  const handleSelect = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#0A0A0A] flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-1">
          <div className="px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            SYSTEM // NAVIGATION
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xs font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 brutal-shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-white dark:text-slate-900'
                        : item.id === 'ai-launch'
                        ? 'text-blue-500'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-xs font-mono text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Admin Portal & Quick Stats */}
        <div className="pt-4 border-t-2 border-slate-900 dark:border-slate-800 space-y-3">
          {isAdmin ? (
            <button
              onClick={() => handleSelect('admin')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xs font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>ADMIN PANEL</span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-1 py-0.2 rounded-xs bg-blue-600 text-white">
                ROOT
              </span>
            </button>
          ) : (
            <button
              onClick={() => handleSelect('admin')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xs font-mono text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>FACULTY / ADMIN</span>
              </div>
              <span className="text-[10px]">LOGIN →</span>
            </button>
          )}

          {/* Quick Academic Progress Widget */}
          <div className="p-3 rounded-xs bg-slate-50 dark:bg-[#121212] border border-slate-300 dark:border-slate-800 font-mono">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase">
              <span>PROGRESS</span>
              <span className="text-blue-600 dark:text-blue-400">{stats.completionRate}%</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden">
              <div
                className="h-full bg-slate-900 dark:bg-blue-500 transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <div className="mt-2 text-[10px] text-slate-500 flex justify-between font-mono">
              <span>{stats.completed} DONE</span>
              <span>{stats.remaining} LEFT</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
