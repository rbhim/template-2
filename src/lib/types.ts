export interface Task {
  id: string;
  name: string;
  completed: boolean;
  order: number;
  status?: 'todo' | 'in-progress' | 'review' | 'completed';
  assignedTo?: string; // Team member ID
}

export interface Note {
  id: string;
  content: string;
  timestamp: string; // ISO date string
  authorId?: string; // Optional reference to team member who created the note
}

export type ProjectStatus = 'on-track' | 'at-risk' | 'delayed' | 'completed';
export type ProjectPriority = 'low' | 'medium' | 'high';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  clientType?: 'private' | 'public'; // Type of client - private or public
  startDate: string; // ISO date string for project start
  dueDate: string;   // ISO date string for project end/due date
  status?: ProjectStatus;
  priority?: ProjectPriority;
  tasks: Task[];
  notes?: Note[]; // Updated to array of Note objects
  assignedTeam?: string[]; // Array of team member IDs
} 