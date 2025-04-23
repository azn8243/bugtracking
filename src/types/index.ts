export type IssueType = "Epic" | "Story" | "Task" | "Bug";
export type IssueStatus = "ToDo" | "InProgress" | "Done" | "Blocked";

export interface Issue {
  id: string;
  title: string;
  description?: string;
  type: IssueType;
  status: IssueStatus;
  projectId: string;
  workspaceId: string;
  parentId?: string; // For linking Tasks/Bugs to Stories/Epics
  createdAt: Date;
  updatedAt: Date;
  // Add fields for assignee, reporter, attachments etc. later
}

export interface Project {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  createdAt: Date;
}

// Example structure combining these
export interface AppData {
  workspaces: Workspace[];
  projects: Project[];
  issues: Issue[];
}