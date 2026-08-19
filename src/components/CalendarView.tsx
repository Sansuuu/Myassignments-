import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Assignment } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { getDeadlineInfo } from '../utils/dateUtils';

export const CalendarView: React.FC = () => {
  const { assignments, subjects, setSelectedAssignment, studentProgressMap } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayAssignments, setSelectedDayAssignments] = useState<{
    dateStr: string;
    items: Assignment[];
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Previous month fill
  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Map assignments to YYYY-MM-DD
  const assignmentsByDate: Record<string, Assignment[]> = {};
  assignments.forEach((a) => {
    if (!assignmentsByDate[a.dueDate]) {
      assignmentsByDate[a.dueDate] = [];
    }
    assignmentsByDate[a.dueDate].push(a);
  });

  const daysArray = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    daysArray.push({
      day: prevMonthDays - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete grid (multiples of 7)
  const remainingCells = 42 - daysArray.length;
  for (let i = 1; i <= remainingCells; i++) {
    daysArray.push({
      day: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] brutal-shadow">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
              ACADEMIC TIMELINE
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F5F5F0] font-display tracking-tight">
              {monthNames[month]} {year}
            </h1>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-bold uppercase rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            TODAY
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xs border-2 border-slate-900 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xs border-2 border-slate-900 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] brutal-shadow overflow-hidden">
        {/* Day Names Row */}
        <div className="grid grid-cols-7 border-b-2 border-slate-900 dark:border-slate-800 bg-slate-100 dark:bg-[#0A0A0A] font-mono text-xs font-black uppercase text-center py-2.5 text-slate-700 dark:text-slate-300">
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        {/* Day Cells Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 dark:divide-slate-800">
          {daysArray.map((d, index) => {
            const currentYear = d.year;
            const currentMonth = d.month + 1;
            const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
            const dayAssignments = assignmentsByDate[dateKey] || [];
            const isToday = dateKey === todayStr;
            const isSelected = selectedDayAssignments?.dateStr === dateKey;

            return (
              <div
                key={index}
                onClick={() => {
                  if (dayAssignments.length > 0) {
                    setSelectedDayAssignments({ dateStr: dateKey, items: dayAssignments });
                  } else {
                    setSelectedDayAssignments(null);
                  }
                }}
                className={`min-h-[90px] sm:min-h-[110px] p-2 transition-all cursor-pointer ${
                  !d.isCurrentMonth
                    ? 'bg-slate-50/50 dark:bg-[#0E0E0E]/50 text-slate-400 dark:text-slate-600'
                    : 'bg-white dark:bg-[#121212] text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                } ${isToday ? 'ring-2 ring-blue-600 dark:ring-blue-400 ring-inset bg-blue-50/20 dark:bg-blue-950/20' : ''} ${
                  isSelected ? 'bg-blue-50 dark:bg-blue-950/40' : ''
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                  <span
                    className={`font-black ${
                      isToday
                        ? 'px-1.5 py-0.2 rounded-xs bg-blue-600 text-white font-bold'
                        : ''
                    }`}
                  >
                    {d.day}
                  </span>

                  {dayAssignments.length > 0 && (
                    <span className="font-mono text-[10px] font-bold px-1 rounded-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                      {dayAssignments.length}
                    </span>
                  )}
                </div>

                {/* Assignment Mini Markers */}
                <div className="space-y-1">
                  {dayAssignments.slice(0, 2).map((a) => {
                    const isDone = studentProgressMap[a.id]?.status === 'completed';
                    return (
                      <div
                        key={a.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssignment(a);
                        }}
                        className={`truncate px-1.5 py-0.5 rounded-xs font-mono text-[10px] font-bold border transition-colors ${
                          isDone
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 line-through'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-500'
                        }`}
                        title={`${a.subjectCode}: ${a.title}`}
                      >
                        {a.subjectCode.split('CIT')[0] || a.subjectCode}: {a.title}
                      </div>
                    );
                  })}

                  {dayAssignments.length > 2 && (
                    <div className="font-mono text-[9px] font-bold text-slate-500 text-right">
                      +{dayAssignments.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Assignment Drawer */}
      {selectedDayAssignments && (
        <div className="p-6 rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] brutal-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-slate-400">
                DATE INSPECTOR
              </span>
              <h3 className="font-mono text-base font-bold text-slate-900 dark:text-white">
                Assignments Due on {selectedDayAssignments.dateStr}
              </h3>
            </div>
            <button
              onClick={() => setSelectedDayAssignments(null)}
              className="font-mono text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              [CLOSE]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedDayAssignments.items.map((assign) => (
              <div
                key={assign.id}
                onClick={() => setSelectedAssignment(assign)}
                className="p-3.5 rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-1.5 py-0.2 rounded-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                      {assign.subjectCode}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {assign.dueTime || '23:59'}
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                    {assign.title}
                  </h4>
                </div>
                <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                  <span>VIEW DETAILS</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
