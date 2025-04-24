import React from 'react';
import { ActivityLog, Issue, Project, Workspace } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For user placeholder
import { formatDistanceToNow } from 'date-fns'; // For relative time
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge'; // To highlight changes

interface ActivityFeedProps {
  logs: ActivityLog[];
  getIssueById: (id: string | null) => Issue | null;
  getProjectById: (id: string | null) => Project | null;
  getWorkspaceById: (id: string | null) => Workspace | null;
}

// Helper to format activity details into a readable string
const formatActivity = (log: ActivityLog, getIssueById: ActivityFeedProps['getIssueById']): React.ReactNode => {
  const { action, details } = log;
  const issueLink = details.issueId ? `/issue/${details.issueId}` : '#';
  const issueTitle = details.issueTitle || (details.issueId ? getIssueById(details.issueId)?.title : null) || 'an issue';
  const issueDisplay = details.issueId ? <Link to={issueLink} className="font-medium text-primary hover:underline">{issueTitle}</Link> : issueTitle;

  switch (action) {
    case 'CREATE_ISSUE':
      return <>created {issueDisplay} in project "{details.projectName || details.projectId}"</>;
    case 'DELETE_ISSUE':
      return <>deleted issue "{details.issueTitle || details.issueId}" from project "{details.projectName || details.projectId}"</>;
    case 'UPDATE_ISSUE_TITLE':
       return <>renamed {issueDisplay} from "{details.oldValue}" to "{details.newValue}"</>;
    case 'UPDATE_ISSUE_DESC':
        return <>updated the description for {issueDisplay}</>; // Keep it simple
    case 'UPDATE_ISSUE_TYPE':
      return <>changed the type of {issueDisplay} from <Badge variant="outline">{details.oldValue}</Badge> to <Badge variant="outline">{details.newValue}</Badge></>;
    case 'UPDATE_ISSUE_STATUS':
       return <>changed the status of {issueDisplay} from <Badge variant="secondary">{details.oldValue}</Badge> to <Badge variant="secondary">{details.newValue}</Badge></>;
    case 'ADD_ATTACHMENT':
        return <>added attachment "{details.attachmentName}" to {issueDisplay}</>;
    case 'DELETE_ATTACHMENT':
        return <>deleted attachment "{details.attachmentName}" from {issueDisplay}</>;
    case 'CREATE_PROJECT':
        return <>created project "{details.projectName}" in workspace "{details.workspaceName || details.workspaceId}"</>;
    case 'DELETE_PROJECT':
        return <>deleted project "{details.projectName}" from workspace "{details.workspaceName || details.workspaceId}"</>;
    case 'CREATE_WORKSPACE':
        return <>created workspace "{details.workspaceName}"</>;
    case 'DELETE_WORKSPACE':
        return <>deleted workspace "{details.workspaceName}"</>;
    default:
      return `performed action: ${action}`; // Fallback
  }
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ logs, getIssueById }) => {
  return (
    <Card className="mt-6"> {/* Add margin top */}
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <ul className="space-y-4">
            {logs.slice(0, 15).map((log) => ( // Show latest 15 items
              <li key={log.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 border">
                  {/* Placeholder for user avatar - replace with actual user data later */}
                  <AvatarFallback>{log.userName ? log.userName.substring(0, 1) : 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">{log.userName || 'System'}</span>{' '}
                    {formatActivity(log, getIssueById)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
         {logs.length > 15 && (
            <p className="text-center text-xs text-muted-foreground mt-4">Showing latest 15 activities.</p>
         )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;