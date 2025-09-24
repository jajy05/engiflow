export type DocumentStatus = 'Approved' | 'Rejected' | 'In Review' | 'Commented' | 'In Progress';

export type View = 'dashboard' | 'documents' | 'detail' | 'profile' | 'projects' | 'search' | 'calendar' | 'notes' | 'chat' | 'calling' | 'settings';

export type ReviewerRole = 'Approver' | 'Commenter' | 'Viewer';

export type DocumentDiscipline = 'Civil' | 'Structural' | 'Mechanical' | 'Electrical' | 'Control & Instruments' | 'General' | 'Contract';

export type UserRole = 'Admin' | 'Member';

export type SubscriptionPlan = 'Free' | 'Pro';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled';

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  memberLimit: number;
}

export interface Organization {
  id: string;
  name: string;
  subscription: Subscription;
}

export interface Reviewer {
  email: string;
  role: ReviewerRole;
}

export interface User {
  name: string;
  email: string;
  password?: string;
  photoUrl?: string;
  role: UserRole;
  organizationId: string;
  status: 'active' | 'pending';
}

export interface HistoryEntry {
  status: DocumentStatus;
  date: string;
  user: string;
  userEmail: string;
  comment: string;
  version: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  projectCode: string;
  organizationId: string;
  team: string[];
}

export type NewProjectData = Omit<Project, 'id' | 'lastUpdated' | 'organizationId'>;

export interface Document {
  id: string;
  name:string;
  type: string;
  uploadedBy: User;
  uploadDate: string;
  status: DocumentStatus;
  reviewers: Reviewer[];
  password?: string;
  history: HistoryEntry[];
  reminderDate?: string;
  projectCode?: string;
  version: number;
  isLatest: boolean;
  fileUrl?: string;
  discipline: DocumentDiscipline;
  organizationId: string;
  scratchpadContent?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userEmail: string;
  date: string; // YYYY-MM-DD
  title: string;
  isCompleted: boolean;
  priority: TaskPriority;
  organizationId: string;
}

export interface Note {
  id: string;
  userEmail: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
}


export type CalendarEventType = 'deadline' | 'upload' | 'task' | 'holiday';

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: CalendarEventType;
  documentId?: string;
  isCompleted?: boolean; // For tasks
  priority?: TaskPriority; // For tasks
}

export interface ChatMessage {
  id: string;
  senderEmail: string;
  receiverEmail: string;
  text: string;
  timestamp: string;
  organizationId: string;
}

export interface ActiveCall {
  user: User;
  type: 'outgoing';
}

export interface Notification {
  id: string;
  recipientEmail: string;
  documentId: string;
  documentName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  organizationId: string;
}