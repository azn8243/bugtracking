export type IssueType = 'Epic' | 'Story' | 'Task' | 'Bug';
export type IssueStatus = 'ToDo' | 'InProgress' | 'Done' | 'Blocked';
// --- Add Priority Type ---
export type IssuePriority = 'Low' | 'Medium' | 'High';

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
  priority: IssuePriority; // Add priority field
  projectId: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: Attachment[];
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
  | 'UPDATE_ISSUE_PRIORITY' // Add priority update action
  | 'DELETE_ISSUE'
  | 'ADD_ATTACHMENT'
  | 'DELETE_ATTACHMENT';

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  timestamp: Date;
  userId?: string;
  userName?: string;
  details: {
    workspaceId?: string;
    workspaceName?: string;
    projectId?: string;
    projectName?: string;
    issueId?: string;
    issueTitle?: string;
    attachmentName?: string;
    oldValue?: string;
    newValue?: string;
    fieldName?: string; // e.g., 'status', 'type', 'priority'
  };
}