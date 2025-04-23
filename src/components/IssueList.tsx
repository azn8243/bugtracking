import React from 'react';
import { Issue } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, FileDown, ChevronRight } from 'lucide-react'; // Import icons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from 'lucide-react';

interface IssueListProps {
  issues: Issue[];
  projectId: string | null;
  workspaceName: string | null; // Add workspace name
  projectName: string | null;   // Add project name
  onAddIssue: () => void;
  onDeleteIssue: (id: string) => void;
  onExportIssues: (format: 'csv') => void;
}

const IssueList: React.FC<IssueListProps> = ({
    issues,
    projectId,
    workspaceName, // Destructure names
    projectName,   // Destructure names
    onAddIssue,
    onDeleteIssue,
    onExportIssues
}) => {
  if (!projectId) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm bg-background h-full"> {/* Added h-full */}
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
    // Added min-h-0 to prevent flexbox overflow issues with table
    <Card className="w-full flex-1 flex flex-col min-h-0">
       <CardHeader className="flex flex-row items-center justify-between">
        {/* Breadcrumbs and Title */}
        <div className="flex items-center space-x-2">
            {workspaceName && (
                <span className="text-muted-foreground text-sm">{workspaceName}</span>
            )}
            {workspaceName && projectName && (
                 <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            {projectName && (
                <span className="text-muted-foreground text-sm">{projectName}</span>
            )}
             {projectName && (
                 <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <CardTitle className="text-lg">Issues</CardTitle> {/* Slightly smaller title */}
        </div>
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
            <Button onClick={() => onExportIssues('csv')} variant="outline" size="sm" disabled={filteredIssues.length === 0}>
                <FileDown className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={onAddIssue} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Issue
            </Button>
        </div>
      </CardHeader>
      {/* Added overflow-auto directly to CardContent */}
      <CardContent className="flex-1 overflow-auto">
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
                <TableHead className="w-[50px] text-right">Actions</TableHead>
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
                      issue.status === 'Done' ? 'outline' :
                      'destructive' // Blocked
                    }>{issue.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{issue.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => onDeleteIssue(issue.id)}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
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