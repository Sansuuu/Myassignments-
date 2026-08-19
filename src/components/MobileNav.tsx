import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Clock,
  BookOpen,
  CalendarDays,
  Sparkles,
  User,
  ShieldCheck,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, stats } = useApp();
  const { isAdmin } = useAuth();

  const items: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
  }[] = [
    { id: 'dashboard', label: 'HOME', icon: LayoutDashboard },
    {
      id: 'today',
      label: 'URGENT',
      icon: Clock,
      badge: stats.overdue + stats.dueToday > 0 ? stats.overdue + stats.dueToday : undefined,
    },
    { id: 'subjects', label: 'COURSES', icon: BookOpen },
    { id: 'calendar', label: 'DATES', icon: CalendarDays },
    { id: 'ai-tutor', label: 'AI', icon: Sparkles },
    { id: 'profile', label: 'USER', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-t-2 border-slate-900 dark:border-slate-800 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xs font-mono transition-all ${
                isActive
                  ? 'text-slate-900 dark:text-white font-black'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-xs bg-rose-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] uppercase tracking-tighter mt-0.5">
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-slate-900 dark:bg-blue-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
