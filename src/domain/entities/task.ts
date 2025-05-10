/**
 * Task entity representing the core business object
 */
export interface Task {
  id: string;
  title: string;
  content?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToId?: string | null;
  teamId: string;
  dueDate?: Date | null;
  createdAt: Date;
}

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in-progress",
  DONE = "done"
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

export interface TaskWithRelations extends Task {
  subtasks?: SubTask[];
  attachments?: Attachment[];
  team?: Team;
  assignedTo?: User | null;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  taskId: string;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username?: string | null;
  email: string;
}
