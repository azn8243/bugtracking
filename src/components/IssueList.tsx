import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { Issue, IssueType, IssueStatus } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, FileDown, ChevronRight, ChevronDown, ListPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal } from 'lucide-react';

const issueTypes: IssueType[] = ['Bug', 'Task', 'Story', 'Epic'];
const issueStatuses: IssueStatus[] = ['ToDo', 'InProgress', 'Done', 'Blocked'];

interface IssueListProps {
  issues: Issue[];
  projectId: string | null;
  workspaceName: string | null;
  projectName: string | null;
  onAddIssue: () => void;
  onAddBulkIssues: () => void;
  // Update signature to match what Index provides (only type/status)
  onUpdateIssue: (id: string, updates: Partial<Pick<Issue, 'type' | 'status'>>) => void;
  onDeleteIssue: (id: string) => void; // Changed to requestDeleteIssue in Index, just needs ID here
  onExportIssues: (format: 'csv') => void;
}

const IssueList: React.FC<IssueListProps> = ({
    issues,
    projectId,
    workspaceName,
    projectName,
    onAddIssue,
    onAddBulkIssues,
    onUpdateIssue, // Receive the specific update handler
    onDeleteIssue,
    onExportIssues
}) => {
  if (!projectId) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm bg-background h-full">
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

  const handleTypeChange = (issueId: string, newType: string) => {
    onUpdateIssue(issueId, { type: newType as IssueType }); // Use the passed handler
  };

  const handleStatusChange = (issueId: string, newStatus: string) => {
     onUpdateIssue(issueId, { status: newStatus as IssueStatus }); // Use the passed handler
  };


  return (
    <Card className="w-full flex-1 flex flex-col min-h-0">
       <CardHeader className="flex flex-row items-center justify-between">
        {/* Breadcrumbs and Title */}
        <div className="flex items-center space-x-2">
            {workspaceName && <span className="text-muted-foreground text-sm">{workspaceName}</span>}
            {workspaceName && projectName && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            {projectName && <span className="text-muted-foreground text-sm">{projectName}</span>}
             {projectName && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            <CardTitle className="text-lg">Issues</CardTitle>
        </div>
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
            <Button onClick={() => onExportIssues('csv')} variant="outline" size="sm" disabled={filteredIssues.length === 0}>
                <FileDown className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Issue <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onAddIssue}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Single Issue
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onAddBulkIssues}>
                         <ListPlus className="mr-2 h-4 w-4" /> Add Bulk Issues
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {filteredIssues.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
             <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">No Issues Yet</h3>
                <p className="text-sm text-muted-foreground">
                    Use the "Add Issue" button to create the first issue.
                </p>
             </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-[130px]">Type</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead className="w-[120px]">Created</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{issue.id.substring(0, 6)}</TableCell>
                  {/* Wrap title in Link */}
                  <TableCell className="font-medium">
                    <Link to={`/issue/${issue.id}`} className="hover:underline hover:text-primary">
                        {issue.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                     <Select value={issue.type} onValueChange={(newType) => handleTypeChange(issue.id, newType)}>
                        <SelectTrigger className="h-8 text-xs px-2 py-1">
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {issueTypes.map(type => (
                                <SelectItem key={type} value={type} className="text-xs">
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                     </Select>
                  </TableCell>
                  <TableCell>
                     <Select value={issue.status} onValueChange={(newStatus) => handleStatusChange(issue.id, newStatus)}>
                        <SelectTrigger className="h-8 text-xs px-2 py-1">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {issueStatuses.map(status => (
                                <SelectItem key={status} value={status} className="text-xs">
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                     </Select>
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
                                onClick={() => onDeleteIssue(issue.id)} // Call prop directly
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