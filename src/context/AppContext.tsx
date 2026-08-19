import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Subject,
  Assignment,
  StudentProgress,
  AssignmentStatus,
  ActiveTab,
  AssignmentFilter,
  AssignmentStats,
} from '../types';
import { useAuth } from './AuthContext';
import {
  ensureInitialSubjects,
  subscribeToSubjects,
  subscribeToAssignments,
  subscribeToStudentProgress,
  subscribeToAllProgress,
  updateStudentProgressStatus,
  getLocalProgressCache,
} from '../services/db';
import { parseAssignmentDueDate, getDeadlineInfo, sortAssignmentsByUrgency } from '../utils/dateUtils';
import { INITIAL_SUBJECTS } from '../utils/constants';

interface ToastInfo {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  subjects: Subject[];
  assignments: Assignment[];
  studentProgressMap: Record<string, StudentProgress>;
  allProgressList: StudentProgress[];
  loadingData: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  filters: AssignmentFilter;
  setFilters: React.Dispatch<React.SetStateAction<AssignmentFilter>>;
  resetFilters: () => void;
  selectedAssignment: Assignment | null;
  setSelectedAssignment: (assignment: Assignment | null) => void;
  aiTutorContext: Assignment | null;
  setAiTutorContext: (assignment: Assignment | null) => void;
  openAITutorWithAssignment: (assignment: Assignment) => void;
  stats: AssignmentStats;
  remainingAssignments: Assignment[];
  completedAssignments: Assignment[];
  filteredAssignments: Assignment[];
  todayAssignments: {
    dueToday: Assignment[];
    dueTomorrow: Assignment[];
    overdue: Assignment[];
    upcoming: Assignment[];
  };
  markStatus: (assignmentId: string, subjectId: string, status: AssignmentStatus) => Promise<void>;
  toasts: ToastInfo[];
  removeToast: (id: string) => void;
  showToast: (title: string, message?: string, type?: ToastInfo['type']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, studentName, isAdmin } = useAuth();

  // Resolve active student user ID across Firebase Auth & Local Sessions
  const activeUserId = useMemo(() => {
    if (currentUser?.uid) return currentUser.uid;
    if (userProfile?.userId) return userProfile.userId;
    const stored = localStorage.getItem('cse_hub_local_uid');
    if (stored) return stored;
    return 'local_student_default';
  }, [currentUser?.uid, userProfile?.userId]);

  const [subjects, setSubjects] = useState<Subject[]>(() =>
    INITIAL_SUBJECTS.map((s) => ({ id: s.code, ...s }))
  );
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentProgressMap, setStudentProgressMap] = useState<Record<string, StudentProgress>>({});
  const [allProgressList, setAllProgressList] = useState<StudentProgress[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [aiTutorContext, setAiTutorContext] = useState<Assignment | null>(null);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const [filters, setFilters] = useState<AssignmentFilter>({
    subjectId: 'all',
    status: 'all',
    priority: 'all',
    searchQuery: '',
    deadlineFilter: 'all',
  });

  const showToast = (title: string, message?: string, type: ToastInfo['type'] = 'info') => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const resetFilters = () => {
    setFilters({
      subjectId: 'all',
      status: 'all',
      priority: 'all',
      searchQuery: '',
      deadlineFilter: 'all',
    });
  };

  // Seed subjects and setup listeners on mount
  useEffect(() => {
    let unsubSubjects = () => {};
    let unsubAssignments = () => {};

    const initData = async () => {
      try {
        await ensureInitialSubjects();
      } catch (err) {
        console.warn('Subject seeding notice:', err);
      }

      unsubSubjects = subscribeToSubjects(
        (subjs) => {
          if (subjs.length > 0) setSubjects(subjs);
        },
        (err) => console.warn('Subjects sub error:', err)
      );

      unsubAssignments = subscribeToAssignments(
        (assigns) => {
          setAssignments(assigns);
          setLoadingData(false);
        },
        (err) => console.warn('Assignments sub error:', err)
      );
    };

    initData();

    return () => {
      unsubSubjects();
      unsubAssignments();
    };
  }, []);

  // Listen to student personal progress for active user session
  useEffect(() => {
    if (!activeUserId) {
      setStudentProgressMap(getLocalProgressCache());
      return;
    }

    const unsub = subscribeToStudentProgress(activeUserId, (map) => {
      setStudentProgressMap(map);
    });

    let unsubAll = () => {};
    if (isAdmin) {
      unsubAll = subscribeToAllProgress((list) => {
        setAllProgressList(list);
      });
    }

    return () => {
      unsub();
      unsubAll();
    };
  }, [activeUserId, isAdmin]);

  // Mark status helper
  const markStatus = async (
    assignmentId: string,
    subjectId: string,
    newStatus: AssignmentStatus
  ): Promise<void> => {
    const userId = activeUserId;
    const currentName = studentName || 'Student';

    // Optimistic local state update
    setStudentProgressMap((prev) => ({
      ...prev,
      [assignmentId]: {
        id: `${userId}_${assignmentId}`,
        userId: userId,
        studentName: currentName,
        assignmentId,
        subjectId,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
      },
    }));

    try {
      await updateStudentProgressStatus(
        userId,
        currentName,
        assignmentId,
        subjectId,
        newStatus
      );

      if (newStatus === 'completed') {
        showToast('Assignment Completed! 🎉', 'Moved to your completed assignments section.', 'success');

        // Check if all published assignments are now completed
        const visibleAssignments = assignments.filter((a) => a.published);
        const remainingCount = visibleAssignments.filter((a) => {
          if (a.id === assignmentId) return false;
          return studentProgressMap[a.id]?.status !== 'completed';
        }).length;

        if (remainingCount === 0 && visibleAssignments.length > 0) {
          try {
            confetti({
              particleCount: 120,
              spread: 75,
              origin: { y: 0.6 },
              colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'],
            });
          } catch {
            // Non-critical
          }
        }
      } else if (newStatus === 'in_progress') {
        showToast('Marked In Progress 🟡', 'Assignment is marked as currently being worked on.', 'info');
      } else {
        showToast('Status Reset', 'Assignment reset to Not Started.', 'info');
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      showToast('Update Failed', 'Could not sync status with cloud database.', 'error');
    }
  };

  const openAITutorWithAssignment = (assignment: Assignment) => {
    setAiTutorContext(assignment);
    setActiveTab('ai-launch');
  };

  // Published assignments visible to student (Admins see drafts too)
  const accessibleAssignments = useMemo(() => {
    if (isAdmin) return assignments;
    return assignments.filter((a) => a.published);
  }, [assignments, isAdmin]);

  // Filtered list
  const filteredAssignments = useMemo(() => {
    return accessibleAssignments.filter((assign) => {
      // Subject filter
      if (filters.subjectId && filters.subjectId !== 'all' && assign.subjectId !== filters.subjectId) {
        return false;
      }

      // Status filter
      const userStatus = studentProgressMap[assign.id]?.status || 'not_started';
      if (filters.status && filters.status !== 'all' && userStatus !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority && filters.priority !== 'all' && assign.priority !== filters.priority) {
        return false;
      }

      // Search Query
      if (filters.searchQuery?.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = assign.title.toLowerCase().includes(q);
        const matchesDesc = assign.description.toLowerCase().includes(q);
        const matchesSubject = assign.subjectName.toLowerCase().includes(q) || assign.subjectCode.toLowerCase().includes(q);
        const matchesTeacher = assign.teacher?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSubject && !matchesTeacher) {
          return false;
        }
      }

      // Deadline filter
      if (filters.deadlineFilter && filters.deadlineFilter !== 'all') {
        const info = getDeadlineInfo(assign.dueDate, assign.dueTime);
        if (filters.deadlineFilter === 'overdue' && !info.isOverdue) return false;
        if (filters.deadlineFilter === 'today' && !info.isDueToday) return false;
        if (filters.deadlineFilter === 'tomorrow' && !info.isDueTomorrow) return false;
        if (filters.deadlineFilter === 'this_week' && info.category !== 'today' && info.category !== 'tomorrow' && info.category !== 'soon') return false;
        if (filters.deadlineFilter === 'later' && info.category !== 'later') return false;
      }

      return true;
    });
  }, [accessibleAssignments, filters, studentProgressMap]);

  // Remaining assignments for current student (Not completed, sorted by urgency)
  const remainingAssignments = useMemo(() => {
    const list = accessibleAssignments.filter(
      (a) => (studentProgressMap[a.id]?.status || 'not_started') !== 'completed'
    );
    return sortAssignmentsByUrgency(list);
  }, [accessibleAssignments, studentProgressMap]);

  // Completed assignments for current student
  const completedAssignments = useMemo(() => {
    return accessibleAssignments.filter(
      (a) => studentProgressMap[a.id]?.status === 'completed'
    );
  }, [accessibleAssignments, studentProgressMap]);

  // Breakdown for Today Page
  const todayAssignments = useMemo(() => {
    const dueToday: Assignment[] = [];
    const dueTomorrow: Assignment[] = [];
    const overdue: Assignment[] = [];
    const upcoming: Assignment[] = [];

    accessibleAssignments.forEach((assign) => {
      const isCompleted = studentProgressMap[assign.id]?.status === 'completed';
      if (isCompleted) return; // focus on uncompleted for today urgency

      const info = getDeadlineInfo(assign.dueDate, assign.dueTime);
      if (info.isOverdue) {
        overdue.push(assign);
      } else if (info.isDueToday) {
        dueToday.push(assign);
      } else if (info.isDueTomorrow) {
        dueTomorrow.push(assign);
      } else {
        upcoming.push(assign);
      }
    });

    return {
      dueToday: sortAssignmentsByUrgency(dueToday),
      dueTomorrow: sortAssignmentsByUrgency(dueTomorrow),
      overdue: sortAssignmentsByUrgency(overdue),
      upcoming: sortAssignmentsByUrgency(upcoming),
    };
  }, [accessibleAssignments, studentProgressMap]);

  // Computed aggregate stats
  const stats = useMemo<AssignmentStats>(() => {
    const total = accessibleAssignments.length;
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    let dueToday = 0;
    let dueTomorrow = 0;
    let overdue = 0;

    accessibleAssignments.forEach((a) => {
      const userStatus = studentProgressMap[a.id]?.status || 'not_started';
      if (userStatus === 'completed') {
        completed++;
      } else if (userStatus === 'in_progress') {
        inProgress++;
      } else {
        notStarted++;
      }

      if (userStatus !== 'completed') {
        const info = getDeadlineInfo(a.dueDate, a.dueTime);
        if (info.isOverdue) overdue++;
        else if (info.isDueToday) dueToday++;
        else if (info.isDueTomorrow) dueTomorrow++;
      }
    });

    const remaining = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      remaining,
      inProgress,
      notStarted,
      dueToday,
      dueTomorrow,
      overdue,
      completionRate,
    };
  }, [accessibleAssignments, studentProgressMap]);

  return (
    <AppContext.Provider
      value={{
        subjects,
        assignments,
        studentProgressMap,
        allProgressList,
        loadingData,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        resetFilters,
        selectedAssignment,
        setSelectedAssignment,
        aiTutorContext,
        setAiTutorContext,
        openAITutorWithAssignment,
        stats,
        remainingAssignments,
        completedAssignments,
        filteredAssignments,
        todayAssignments,
        markStatus,
        toasts,
        removeToast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
