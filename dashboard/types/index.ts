export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  isActive?: boolean;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  moderator: User;
  members: User[];
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  project: Project | string;
  assignedTo?: User;
  createdBy: User;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  _id: string;
  task: Task;
  resolvedBy: User;
  resolutionNotes: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: User;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

export interface Analytics {
  projectStatus?: Array<{ _id: string; count: number }>;
  taskDistribution?: Array<{ _id: string; count: number }>;
  totals?: {
    projects: number;
    tasks: number;
    users: number;
    tickets: number;
  };
  ticketsPerUser?: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    ticketsResolved: number;
  }>;
  moderatorPerformance?: Array<{
    moderatorId: string;
    moderatorName: string;
    moderatorEmail: string;
    projectsCount: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    resolvedTasks: number;
  }>;
  teamProgress?: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    totalTasks: number;
    openTasks: number;
    inProgressTasks: number;
    resolvedTasks: number;
  }>;
  tasks?: {
    total: number;
    status: Array<{ _id: string; count: number }>;
  };
  tickets?: {
    resolved: number;
    pending: number;
  };
  summary?: {
    totalProjects?: number;
    totalTasks?: number;
    totalTickets?: number;
    openTasks?: number;
    inProgressTasks?: number;
    resolvedTasks?: number;
  };
}

