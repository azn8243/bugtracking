export type IssueType = 'Epic' | 'Story' | 'Task' | 'Bug';
export type IssueStatus = 'ToDo' | 'InProgress' | 'Done' | 'Blocked';

// Define a simple type for attachments (in a real app, this would be more complex)
export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  // In a real app, you'd likely store a URL here after uploading
  // url: string;
  file: File; // Store the File object directly for this local example
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