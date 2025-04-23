export type IssueType = 'Epic' | 'Story' | 'Task' | 'Bug';
export type IssueStatus = 'ToDo' | 'InProgress' | 'Done' | 'Blocked';

export interface Issue {
  id: string;
  title: string;
  description?: string;
  type: IssueType;
  status: IssueStatus;
  projectId: string;
  workspaceId: string;
  createdAt: Date;
  // Add file attachments later
  // attachments?: File[];
}

export interface Project {
  id: string;
  name: string;
  workspaceId: string;
}

export interface Workspace {
  id: string;
  name: string;
}