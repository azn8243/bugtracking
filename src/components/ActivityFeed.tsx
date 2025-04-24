import React from 'react';
import { ActivityLog, Issue, Project, Workspace } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn

interface ActivityFeedProps {
  logs: ActivityLog[];
  getIssueById: (id: string | null) => Issue | null;
  getProjectById: (id: string | null) => Project | null;
  getWorkspaceById: (id: string | null) => Workspace | null;
}

// Helper to get badge color based on priority (copied again for consistency)
const getPriorityBadgeClass = (priority: string): string => {
    switch (priority) {
        case 'High': return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
        case 'Medium': return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700";
        case 'Low': return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
        default: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700";
    }
};

// Helper to format activity details into a readable string for the feed UI
const formatActivityForFeed = (log: ActivityLog, getIssueById: ActivityFeedProps['getIssueById']): React.ReactNode => {
  const { action, details } = log;
  const issueLink = details.issueId ? `/issue/${details.issueId}` : '#';
  const currentIssue = details.issueId ? getIssueById(details.issueId) : null;
  const issueTitle = currentIssue?.title || details.issueTitle || 'an issue';
  const issueDisplay = details.issueId ? <Link to={issueLink} className="font-medium text-primary hover:underline">{issueTitle}</Link> : issueTitle;

  switch (action) {
    case 'CREATE_ISSUE': return <>created {issueDisplay} in project "{details.projectName || details.projectId}"</>;
    case 'DELETE_ISSUE': return <>deleted issue "{details.issueTitle || details.issueId}" from project "{details.projectName || details.projectId}"</>;
    case 'UPDATE_ISSUE_TITLE': return <>renamed {issueDisplay} from "{details.oldValue}" to "{details.newValue}"</>;
    case 'UPDATE_ISSUE_DESC': return <>updated the description for {issueDisplay}</>;
    case 'UPDATE_ISSUE_TYPE': return <>changed the type of {issueDisplay} from <Badge variant="outline">{details.oldValue}</Badge> to <Badge variant="outline">{details.newValue}</Badge></>;
    case 'UPDATE_ISSUE_STATUS': return <>changed the status of {issueDisplay} from <Badge variant="secondary">{details.oldValue}</Badge> to <Badge variant="secondary">{details.newValue}</Badge></>;
    // --- Add Priority Formatting ---
    case 'UPDATE_ISSUE_PRIORITY':
        return <>changed the priority of {issueDisplay} from <Badge variant="outline" className={cn("border", getPriorityBadgeClass(details.oldValue ?? ''))}>{details.oldValue}</Badge> to <Badge variant="outline" className={cn("border", getPriorityBadgeClass(details.newValue ?? ''))}>{details.newValue}</Badge></>;
    case 'ADD_ATTACHMENT': return <>added attachment "{details.attachmentName}" to {issueDisplay}</>;
    case 'DELETE_ATTACHMENT': return <>deleted attachment "{details.attachmentName}" from {issueDisplay}</>;
    case 'CREATE_PROJECT': return <>created project "{details.projectName}" in workspace "{details.workspaceName || details.workspaceId}"</>;
    case 'DELETE_PROJECT': return <>deleted project "{details.projectName}" from workspace "{details.workspaceName || details.workspaceId}"</>;
    case 'CREATE_WORKSPACE': return <>created workspace "{details.workspaceName}"</>;
    case 'DELETE_WORKSPACE': return <>deleted workspace "{details.workspaceName}"</>;
    default:
      const detailsString = Object.entries(details).map(([key, value]) => `${key}: ${value}`).join(', ');
      return <>performed action: {action} {detailsString ? `(${detailsString})` : ''}</>;
  }
};

// Helper to format activity details into a business-friendly summary string
const formatActivityForSummary = (log: ActivityLog): string => {
    const { action, details, timestamp } = log;
    const timeStr = format(timestamp, 'Pp');
    const user = log.userName || 'System';
    const issueTitle = details.issueTitle || 'an issue';
    let summary = `${timeStr} - ${user} `;

    switch (action) {
        case 'CREATE_ISSUE': summary += `created issue "${issueTitle}" in project "${details.projectName || details.projectId}".`; break;
        case 'DELETE_ISSUE': summary += `deleted issue "${details.issueTitle || details.issueId}" from project "${details.projectName || details.projectId}".`; break;
        case 'UPDATE_ISSUE_TITLE': summary += `renamed issue "${details.oldValue}" to "${details.newValue}" (ID: ${details.issueId?.substring(details.issueId.lastIndexOf('-') + 1).substring(0,6)}).`; break;
        case 'UPDATE_ISSUE_DESC': summary += `updated the description for issue "${issueTitle}" (ID: ${details.issueId?.substring(details.issueId.lastIndexOf('-') + 1).substring(0,6)}).`; break;
        case 'UPDATE_ISSUE_TYPE': summary += `changed type for issue "${issueTitle}" from "${details.oldValue}" to "${details.newValue}".`; break;
        case 'UPDATE_ISSUE_STATUS': summary += `changed status for issue "${issueTitle}" from "${details.oldValue}" to "${details.newValue}".`; break;
        // --- Add Priority Formatting ---
        case 'UPDATE_ISSUE_PRIORITY': summary += `changed priority for issue "${issueTitle}" from "${details.oldValue}" to "${details.newValue}".`; break;
        case 'ADD_ATTACHMENT': summary += `added attachment "${details.attachmentName}" to issue "${issueTitle}".`; break;
        case 'DELETE_ATTACHMENT': summary += `deleted attachment "${details.attachmentName}" from issue "${issueTitle}".`; break;
        case 'CREATE_PROJECT': summary += `created project "${details.projectName}" in workspace "${details.workspaceName || details.workspaceId}".`; break;
        case 'DELETE_PROJECT': summary += `deleted project "${details.projectName}" from workspace "${details.workspaceName || details.workspaceId}".`; break;
        case 'CREATE_WORKSPACE': summary += `created workspace "${details.workspaceName}".`; break;
        case 'DELETE_WORKSPACE': summary += `deleted workspace "${details.workspaceName}".`; break;
        default: summary += `performed unhandled action: ${action}.`; break;
    }
    return summary;
};

// Function to generate the full summary text content
const generateActivitySummaryText = (logs: ActivityLog[]): string => { /* ... remains the same ... */ };

const ActivityFeed: React.FC<ActivityFeedProps> = ({ logs, getIssueById }) => {
  // Download handler
  const downloadSummary = () => { /* ... remains the same ... */ };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="outline" size="sm" onClick={downloadSummary} disabled={logs.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Download Summary
        </Button>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? ( <p className="text-sm text-muted-foreground">No recent activity.</p> )
        : ( <ul className="space-y-4">{logs.slice(0, 15).map((log) => ( <li key={log.id} className="flex items-start space-x-3"><Avatar className="h-8 w-8 border"><AvatarFallback>{log.userName ? log.userName.substring(0, 1) : 'S'}</AvatarFallback></Avatar><div className="flex-1 text-sm"><p className="text-muted-foreground"><span className="font-medium text-foreground">{log.userName || 'System'}</span>{' '}{formatActivityForFeed(log, getIssueById)}</p><p className="text-xs text-muted-foreground mt-0.5">{formatDistanceToNow(log.timestamp, { addSuffix: true })}</p></div></li> ))}</ul> )}
         {logs.length > 15 && ( <p className="text-center text-xs text-muted-foreground mt-4">Showing latest 15 activities in feed. Full summary includes all logs.</p> )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;