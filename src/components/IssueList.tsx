import React from 'react';
import { Issue } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';

interface IssueListProps {
  issues: Issue[];
  projectId: string | null;
  onAddIssue: () => void;
}

const IssueList: React.FC<IssueListProps> = ({ issues, projectId, onAddIssue }) => {
  if (!projectId) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm bg-background">
            <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">No Project Selected</h3>
                <p className="text-sm text-muted-foreground">
                    Select a project from the sidebar to view its issues.
                </p>
            </div>
        </div>
    );
  }

  const filteredIssues = issues.filter(issue => issue.projectId === projectId);

  return (
    // Use flex-1 to fill available space in the layout panel
    <Card className="w-full flex-1 flex flex-col">
       <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Issues</CardTitle>
        <Button onClick={onAddIssue} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Issue
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto"> {/* Allow content to scroll */}
        {filteredIssues.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
             <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">No Issues Yet</h3>
                <p className="text-sm text-muted-foreground">
                    Click "Add Issue" to create the first issue for this project.
                </p>
             </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[120px]">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{issue.id.substring(0, 6)}</TableCell>
                  <TableCell className="font-medium">{issue.title}</TableCell>
                  <TableCell>
                    <Badge variant={
                      issue.type === 'Epic' ? 'destructive' :
                      issue.type === 'Story' ? 'secondary' :
                      issue.type === 'Task' ? 'outline' :
                      'default' // Bug
                    }>{issue.type}</Badge>
                  </TableCell>
                  <TableCell>
                     <Badge variant={
                      issue.status === 'ToDo' ? 'secondary' :
                      issue.status === 'InProgress' ? 'default' :
                      issue.status === 'Done' ? 'outline' : // Consider a 'success' variant if available
                      'destructive' // Blocked
                    }>{issue.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{issue.createdAt.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueList;