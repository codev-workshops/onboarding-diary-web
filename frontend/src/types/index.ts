export type Role = 'recruit' | 'manager' | 'admin';
export type TaskCategory = 'learning' | 'setup' | 'meeting' | 'coding' | 'documentation' | 'other';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'deferred';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type FeedbackType = 'positive' | 'suggestion' | 'concern';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  department?: string;
  startDate?: string;
  avatarUrl?: string;
  managerId?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskLog {
  id: string;
  userId: string;
  date: string;
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

export interface IssueLog {
  id: string;
  userId: string;
  date: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackNote {
  id: string;
  userId: string;
  date: string;
  subject: string;
  type: FeedbackType;
  details: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdditionalNote {
  id: string;
  userId: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  tasks: { total: number; completed: number; inProgress: number; notStarted: number };
  issues: { total: number; open: number; resolved: number };
  feedback: { total: number; positive: number; suggestion: number; concern: number };
  notes: { total: number };
  completionRate: number;
  daysOnboarding: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RecentEntry {
  id: string;
  title: string;
  date: string;
  createdAt: string;
  category: 'task' | 'issue' | 'feedback' | 'note';
  status?: string;
  severity?: string;
  type?: string;
}

export interface ReportData {
  dateRange: { from: string; to: string };
  tasks?: TaskLog[];
  issues?: IssueLog[];
  feedback?: FeedbackNote[];
  notes?: AdditionalNote[];
  summary: Record<string, number | undefined>;
}
