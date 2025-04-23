import React, { useState, useMemo } from 'react'; // Import useState and useMemo
import { Link } from 'react-router-dom';
import { Issue, IssueType, IssueStatus } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import Input
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem, // Import CheckboxItem
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, PlusCircle, Trash2, FileDown, ChevronRight, ChevronDown, ListPlus, Search, Filter, ArrowUpDown, X } from 'lucide-react'; // Import icons
import { Badge } from "@/components/ui/badge"; // Import Badge for filter display

const issueTypes: IssueType[] = ['Bug', 'Task', 'Story', 'Epic'];
const issueStatuses: IssueStatus[] = ['ToDo', 'InProgress', 'Done', 'Blocked'];

// Define sortable columns
type SortableColumn = 'title' | 'type' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface IssueListProps {
  issues: Issue[]; // Receive all issues for the app
  projectId: string | null;
  workspaceName: string | null;
  projectName: string | null;
  onAddIssue: () => void;
  onAddBulkIssues: () => void;
  onUpdateIssue: (id: string, updates: Partial<Pick<Issue, 'type' | 'status'>>) => void;
  onDeleteIssue: (id: string) => void;
  onExportIssues: (format: 'csv') => void;
}

const IssueList: React.FC<IssueListProps> = ({
    issues: allIssues, // Rename prop for clarity
    projectId,
    workspaceName,
    projectName,
    onAddIssue,
    onAddBulkIssues,
    onUpdateIssue,
    onDeleteIssue,
    onExportIssues
}) => {
  // --- Local State for Search, Sort, Filter ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTypes, setFilterTypes] = useState<Set<IssueType>>(new Set());
  const [filterStatuses, setFilterStatuses] = useState<Set<IssueStatus>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortableColumn>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // --- Filtering, Searching, Sorting Logic ---
  const processedIssues = useMemo(() => {
    if (!projectId) return [];

    let filtered = allIssues.filter(issue => issue.projectId === projectId);

    // Apply Type Filters
    if (filterTypes.size > 0) {
      filtered = filtered.filter(issue => filterTypes.has(issue.type));
    }

    // Apply Status Filters
    if (filterStatuses.size > 0) {
       filtered = filtered.filter(issue => filterStatuses.has(issue.status));
    }

    // Apply Search Term
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(lowerSearchTerm) ||
        (issue.description && issue.description.toLowerCase().includes(lowerSearchTerm)) ||
        issue.id.toLowerCase().includes(lowerSearchTerm) // Also search ID
      );
    }

    // Apply Sorting
    filtered.sort((a, b) => {
      let compareA: any;
      let compareB: any;

      switch (sortColumn) {
        case 'title':
          compareA = a.title.toLowerCase();
          compareB = b.title.toLowerCase();
          break;
        case 'type':
          compareA = a.type;
          compareB = b.type;
          break;
        case 'status':
          compareA = a.status;
          compareB = b.status;
          break;
        case 'createdAt':
          compareA = a.createdAt.getTime();
          compareB = b.createdAt.getTime();
          break;
        default:
          return 0;
      }

      if (compareA < compareB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (compareA > compareB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [allIssues, projectId, searchTerm, filterTypes, filterStatuses, sortColumn, sortDirection]);

  // --- Event Handlers ---
  const handleTypeChange = (issueId: string, newType: string) => {
    onUpdateIssue(issueId, { type: newType as IssueType });
  };

  const handleStatusChange = (issueId: string, newStatus: string) => {
     onUpdateIssue(issueId, { status: newStatus as IssueStatus });
  };

  const toggleFilterType = (type: IssueType) => {
    setFilterTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

   const toggleFilterStatus = (status: IssueStatus) => {
    setFilterStatuses(prev => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setFilterTypes(new Set());
    setFilterStatuses(new Set());
  };

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc'); // Default to asc when changing column
    }
  };

  // --- Render Helper for Sortable Header ---
  const renderSortableHeader = (column: SortableColumn, label: string, className?: string) => (
    <TableHead className={className}>
        <Button
            variant="ghost"
            onClick={() => handleSort(column)}
            className="px-2 py-1 h-auto -ml-2"
        >
            {label}
            {sortColumn === column && (
                <ArrowUpDown className={`ml-2 h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
            )}
        </Button>
    </TableHead>
  );

  // --- Main Render ---
  if (!projectId && allIssues.length > 0) { // Check allIssues length to avoid flash on initial load
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

  const hasActiveFilters = filterTypes.size > 0 || filterStatuses.size > 0;

  return (
    <Card className="w-full flex-1 flex flex-col min-h-0">
       <CardHeader>
         {/* Row 1: Breadcrumbs & Add Buttons */}
         <div className="flex flex-row items-center justify-between mb-4">
            {/* Breadcrumbs and Title */}
            <div className="flex items-center space-x-2 flex-wrap"> {/* Allow wrapping */}
                {workspaceName && <span className="text-muted-foreground text-sm">{workspaceName}</span>}
                {workspaceName && projectName && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                {projectName && <span className="text-muted-foreground text-sm">{projectName}</span>}
                {projectName && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <CardTitle className="text-lg">Issues</CardTitle>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0"> {/* Prevent shrinking */}
                <Button onClick={() => onExportIssues('csv')} variant="outline" size="sm" disabled={processedIssues.length === 0}>
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
         </div>
         {/* Row 2: Search & Filter Controls */}
         <div className="flex items-center space-x-2">
            <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search issues (title, description, ID)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8" // Add padding for icon
                />
            </div>
            {/* Filter Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                        {hasActiveFilters && <Badge variant="secondary" className="ml-2 rounded-full px-1.5 py-0 text-xs">{filterTypes.size + filterStatuses.size}</Badge>}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {issueTypes.map((type) => (
                        <DropdownMenuCheckboxItem
                            key={type}
                            checked={filterTypes.has(type)}
                            onCheckedChange={() => toggleFilterType(type)}
                        >
                            {type}
                        </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                     <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     {issueStatuses.map((status) => (
                        <DropdownMenuCheckboxItem
                            key={status}
                            checked={filterStatuses.has(status)}
                            onCheckedChange={() => toggleFilterStatus(status)}
                        >
                            {status}
                        </DropdownMenuCheckboxItem>
                    ))}
                    {hasActiveFilters && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={clearFilters} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                <X className="mr-2 h-4 w-4" /> Clear Filters
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {processedIssues.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
             <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-xl font-bold tracking-tight">No Issues Found</h3>
                <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filter criteria.
                </p>
             </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                {renderSortableHeader('title', 'Title')}
                {renderSortableHeader('type', 'Type', 'w-[130px]')}
                {renderSortableHeader('status', 'Status', 'w-[150px]')}
                {renderSortableHeader('createdAt', 'Created', 'w-[120px]')}
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{issue.id.substring(issue.id.lastIndexOf('-') + 1, issue.id.length).substring(0, 6)}</TableCell> {/* Show last part of UUID */}
                  <TableCell className="font-medium max-w-[300px] truncate"> {/* Add max-width and truncate */}
                    <Link to={`/issue/${issue.id}`} className="hover:underline hover:text-primary" title={issue.title}>
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