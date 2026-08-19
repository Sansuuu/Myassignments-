export type Priority = 'low' | 'medium' | 'high';

export type AssignmentStatus = 'not_started' | 'in_progress' | 'completed';

export interface Subject {
  id: string;
  name: string;
  code: string;
  order: number;
  description?: string;
  color?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm (24-hour)
  priority: Priority;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentType?: string;
  externalUrl?: string;
  teacher?: string;
  instructions?: string;
  published: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgress {
  id: string; // userId_assignmentId
  userId: string;
  studentName: string;
  assignmentId: string;
  subjectId: string;
  status: AssignmentStatus;
  completedAt?: string | null;
  updatedAt: string;
  notes?: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  role: 'student' | 'admin';
  email?: string;
  createdAt: string;
  lastActive: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  assignmentContext?: {
    id: string;
    title: string;
    subjectName: string;
    subjectCode: string;
  };
}

export type ActiveTab =
  | 'dashboard'
  | 'today'
  | 'subjects'
  | 'class-finder'
  | 'calendar'
  | 'completed'
  | 'ai-launch'
  | 'profile'
  | 'admin';

export interface AssignmentFilter {
  subjectId?: string;
  status?: AssignmentStatus | 'all';
  priority?: Priority | 'all';
  searchQuery?: string;
  deadlineFilter?: 'all' | 'overdue' | 'today' | 'tomorrow' | 'this_week' | 'later';
}

export interface AssignmentStats {
  total: number;
  completed: number;
  remaining: number;
  inProgress: number;
  notStarted: number;
  dueToday: number;
  dueTomorrow: number;
  overdue: number;
  completionRate: number;
}
