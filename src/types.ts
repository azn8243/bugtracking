export type IssueType = 'Epic' | 'Story' | 'Task' | 'Bug';
export type IssueStatus = 'ToDo' | 'InProgress' | 'Done' | 'Blocked';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
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
  attachments?: Attachment[];
  // Add last updated timestamp
  updatedAt?: Date;
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

// --- Activity Log ---
export type ActivityAction =
  | 'CREATE_WORKSPACE'
  | 'DELETE_WORKSPACE'
  | 'CREATE_PROJECT'
  | 'DELETE_PROJECT'
  | 'CREATE_ISSUE'
  | 'UPDATE_ISSUE_TITLE'
  | 'UPDATE_ISSUE_DESC'
  | 'UPDATE_ISSUE_TYPE'
  | 'UPDATE_ISSUE_STATUS'
  | 'DELETE_ISSUE'
  | 'ADD_ATTACHMENT'
  | 'DELETE_ATTACHMENT';

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  timestamp: Date;
  userId?: string; // Placeholder for future user tracking
  userName?: string; // Placeholder
  details: {
    workspaceId?: string;
    workspaceName?: string;
    projectId?: string;
    projectName?: string;
    issueId?: string;
    issueTitle?: string;
    attachmentName?: string;
    oldValue?: string; // For updates
    newValue?: string; // For updates
    fieldName?: string; // For updates (e.g., 'status', 'type')
  };
}