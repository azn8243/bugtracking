import React, { useState, useCallback, useMemo } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner, toast } from "@/components/ui/sonner"; // Import toast
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import IssueDetail from "./pages/IssueDetail"; // Import new page
import NotFound from "./pages/NotFound";
import { Workspace, Project, Issue, IssueType, IssueStatus, Attachment } from '@/types'; // Import types
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

const queryClient = new QueryClient();

// --- Initial State (Moved from Index) ---
const initialWorkspaces: Workspace[] = [
  { id: 'ws1', name: 'Personal Workspace' },
  { id: 'ws2', name: 'Team Alpha' },
];
const initialProjects: Project[] = [
  { id: 'proj1', name: 'Bug Tracker App', workspaceId: 'ws1' },
  { id: 'proj2', name: 'Website Redesign', workspaceId: 'ws1' },
  { id: 'proj3', name: 'API Development', workspaceId: 'ws2' },
];
const initialIssues: Issue[] = [
  { id: 'issue-1', title: 'Button not working on login page', description: 'The main login button is unresponsive.', type: 'Bug', status: 'ToDo', projectId: 'proj1', workspaceId: 'ws1', createdAt: new Date(), attachments: [] },
  { id: 'issue-2', title: 'Implement user authentication', description: 'Setup JWT authentication flow.', type: 'Story', status: 'InProgress', projectId: 'proj1', workspaceId: 'ws1', createdAt: new Date(), attachments: [] },
  { id: 'issue-3', title: 'Design new landing page mockups', description: '', type: 'Task', status: 'Done', projectId: 'proj2', workspaceId: 'ws1', createdAt: new Date(), attachments: [] },
  { id: 'issue-4', title: 'Setup database schema', description: 'Define tables for users, projects, issues.', type: 'Task', status: 'ToDo', projectId: 'proj3', workspaceId: 'ws2', createdAt: new Date(), attachments: [] },
  { id: 'issue-5', title: 'Define API endpoints for user profiles', description: 'CRUD operations for user data.', type: 'Epic', status: 'ToDo', projectId: 'proj3', workspaceId: 'ws2', createdAt: new Date(), attachments: [] },
];

// Type for managing confirmation dialog state (can be kept local in Index or lifted if needed elsewhere)
// type DeletionTarget = ... (Keep in Index for now)

const App = () => {
  // --- State Management (Lifted from Index) ---
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);

  // --- Helper Getters ---
  const getWorkspaceById = useCallback((id: string | null) => workspaces.find(ws => ws.id === id) ?? null, [workspaces]);
  const getProjectById = useCallback((id: string | null) => projects.find(p => p.id === id) ?? null, [projects]);
  const getIssueById = useCallback((id: string | null) => issues.find(i => i.id === id) ?? null, [issues]);

  // --- Handlers (Lifted/Modified from Index) ---

  // Workspace/Project Add/Delete (Passed to Index -> Sidebar)
  const handleAddWorkspace = (name: string) => {
    const newWorkspace: Workspace = { id: uuidv4(), name };
    setWorkspaces(prev => [...prev, newWorkspace]);
    return newWorkspace; // Return new workspace for selection logic in Index
  };

  const handleAddProject = (name: string, workspaceId: string) => {
    const newProject: Project = { id: uuidv4(), name, workspaceId };
    setProjects(prev => [...prev, newProject]);
    return newProject; // Return new project for selection logic in Index
  };

  const handleDeleteWorkspace = (id: string) => {
    const projectsToDelete = projects.filter(p => p.workspaceId === id).map(p => p.id);
    setIssues(prev => prev.filter(i => !projectsToDelete.includes(i.projectId)));
    setProjects(prev => prev.filter(p => p.workspaceId !== id));
    setWorkspaces(prev => prev.filter(ws => ws.id !== id));
  };

  const handleDeleteProject = (id: string) => {
    setIssues(prev => prev.filter(i => i.projectId !== id));
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Issue Add/Update/Delete (Passed to Index -> IssueList/Dialogs and IssueDetail)
   const handleAddIssue = (newIssueData: Omit<Issue, 'id' | 'createdAt'>) => {
    const newIssue: Issue = {
      ...newIssueData,
      id: uuidv4(),
      createdAt: new Date(),
      attachments: newIssueData.attachments ?? [],
    };
    setIssues(prev => [...prev, newIssue]);
  };

  const handleAddBulkIssues = (titles: string[], projectId: string, workspaceId: string) => {
    const newIssues: Issue[] = titles.map(title => ({
        id: uuidv4(),
        title: title,
        description: '',
        type: 'Task',
        status: 'ToDo',
        projectId: projectId,
        workspaceId: workspaceId,
        createdAt: new Date(),
        attachments: [],
    }));
    setIssues(prev => [...prev, ...newIssues]);
  };

  // Combined update function for IssueList (inline) and IssueDetail
  const handleUpdateIssue = (id: string, updates: Partial<Pick<Issue, 'title' | 'description' | 'type' | 'status'>>) => {
    setIssues(prevIssues =>
        prevIssues.map(issue =>
            issue.id === id ? { ...issue, ...updates } : issue
        )
    );
    // Maybe add toast here or in the component calling it
  };

  const handleDeleteIssue = (id: string) => {
    setIssues(prev => prev.filter(i => i.id !== id));
  };

  // Attachment Handlers (Passed to IssueDetail)
  const handleAddAttachment = (issueId: string, file: File) => {
     // Basic size check (e.g., 10MB limit) - adjust as needed
     if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large (max 10MB).`);
        return; // Don't add
     }

     const newAttachment: Attachment = {
        id: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
     };

     setIssues(prevIssues =>
        prevIssues.map(issue =>
            issue.id === issueId
                ? { ...issue, attachments: [...(issue.attachments ?? []), newAttachment] }
                : issue
        )
     );
     toast.success(`Attachment "${file.name}" added.`);
  };

  const handleDeleteAttachment = (issueId: string, attachmentId: string) => {
     setIssues(prevIssues =>
        prevIssues.map(issue =>
            issue.id === issueId
                ? { ...issue, attachments: issue.attachments?.filter(att => att.id !== attachmentId) ?? [] }
                : issue
        )
     );
     toast.success(`Attachment deleted.`);
  };


  // Export Handler (Passed to Index -> IssueList)
  const handleExportIssues = (format: 'csv', projectId: string) => {
    const project = getProjectById(projectId);
    if (!project) {
        toast.error("Project not found for export.");
        return;
    }

    const issuesToExport = issues
        .filter(issue => issue.projectId === projectId)
        .map(issue => ({
            ID: issue.id,
            Title: issue.title,
            Description: issue.description ?? '',
            Type: issue.type,
            Status: issue.status,
            Created: issue.createdAt.toISOString(),
            Attachments: issue.attachments?.map(a => a.name).join(', ') ?? '',
        }));
    if (issuesToExport.length === 0) {
        toast.info("No issues to export in this project.");
        return;
    }
    if (format === 'csv') {
        const worksheet = XLSX.utils.json_to_sheet(issuesToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Issues");
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `${project.name.replace(/ /g, '_')}_Issues_${dateStr}.xlsx`;
        XLSX.writeFile(workbook, filename);
        toast.success(`Issues exported to ${filename}`);
    }
  };


  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster /> {/* Default shadcn toaster */}
        <Sonner /> {/* Sonner toaster */}
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Index
                  // Pass state down
                  workspaces={workspaces}
                  projects={projects}
                  issues={issues}
                  // Pass handlers down
                  onAddWorkspace={handleAddWorkspace}
                  onAddProject={handleAddProject}
                  onDeleteWorkspace={handleDeleteWorkspace}
                  onDeleteProject={handleDeleteProject}
                  onAddIssue={handleAddIssue}
                  onAddBulkIssues={handleAddBulkIssues}
                  onUpdateIssue={handleUpdateIssue} // Pass the combined update handler
                  onDeleteIssue={handleDeleteIssue}
                  onExportIssues={handleExportIssues}
                />
              }
            />
            <Route
              path="/issue/:issueId"
              element={
                <IssueDetail
                    // Pass getters and handlers needed for detail view
                    getIssueById={getIssueById}
                    getWorkspaceById={getWorkspaceById}
                    getProjectById={getProjectById}
                    onUpdateIssue={handleUpdateIssue} // Pass the combined update handler
                    onAddAttachment={handleAddAttachment}
                    onDeleteAttachment={handleDeleteAttachment}
                 />
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;