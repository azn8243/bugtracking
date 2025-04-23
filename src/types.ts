export type IssueType = 'Epic' | 'Story' | 'Task' | 'Bug';
export type IssueStatus = 'ToDo' | 'InProgress' | 'Done' | 'Blocked';

// Define the Attachment type
export interface Attachment {
  id: string;       // Unique ID for the attachment
  name: string;     // Original file name
  type: string;     // MIME type (e.g., 'image/png', 'application/pdf')
  size: number;     // File size in bytes
  file: File;       // The actual File object (for local state demo)
  // url?: string;   // In a real app, you'd store a URL after upload
}

export interface Issue {
  id: string;
  title: string;
  description?: string;
  type: IssueType;
  status: IssueStatus;
  projectId: string;
  workspaceId: string;
  createdAt: Date;
  attachments?: Attachment[]; // Add optional attachments array
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