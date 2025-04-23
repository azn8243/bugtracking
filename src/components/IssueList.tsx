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
  onAddIssue: () => void; // Function to trigger adding a new issue
}

const IssueList: React.FC<IssueListProps> = ({ issues, projectId, onAddIssue }) => {
  if (!projectId) {
    return <div className="text-center text-gray-500">Please select a project to view issues.</div>;
  }

  const filteredIssues = issues.filter(issue => issue.projectId === projectId);

  return (
    <Card className="w-full">
       <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Issues</CardTitle>
        <Button onClick={onAddIssue} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Issue
        </Button>
      </CardHeader>
      <CardContent>
        {filteredIssues.length === 0 ? (
          <p className="text-center text-gray-500">No issues found for this project.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">{issue.id.substring(0, 6)}...</TableCell>
                  <TableCell>{issue.title}</TableCell>
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
                  <TableCell>{issue.createdAt.toLocaleDateString()}</TableCell>
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