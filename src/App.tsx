import React, { useState, useCallback } from 'react';
import { Toaster } from "@/components/ui/sonner"; // Use Sonner consistently
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import IssueDetail from "./pages/IssueDetail"; // Import new page
import NotFound from "./pages/NotFound";     // Import NotFound page
import { Workspace, Project, Issue, IssueType, IssueStatus, Attachment } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { toast } from "sonner"; // Import toast from sonner

const queryClient = new QueryClient();

// --- Initial State ---
const initialWorkspaces: Workspace[] = [
  { id: 'ws1', name: 'Personal Workspace' },
  { id: 'ws2', name: 'Team Alpha' },
];
const initialProjects: Project[] = [
  { id: 'proj1', name: 'Bug Tracker App', workspaceId: 'ws1' },
  { id: 'proj2', name: 'Website Redesign', workspaceId: 'ws1' },
  { id: 'proj3', name: 'API Development', workspaceId: 'ws2' },
];
// Ensure initial issues have unique IDs for routing
const initialIssues: Issue[] = [
  { id: `issue-${uuidv4()}`, title: 'Button not working on login page', description: 'The main login button is unresponsive.', type: 'Bug', status: 'ToDo', projectId: 'proj1', workspaceId: 'ws1', createdAt: new Date(), attachments: [] },
  { id: `issue-${uuidv4()}`, title: 'Implement user authentication', description: 'Setup JWT authentication flow.', type: 'Story', status: 'InProgress', projectId: 'proj1', workspaceId: 'ws1', createdAt: new Date(), attachments: [] },
  { id: `issue-${uuidv4()}`, title: 'Design new landing page mockups', description: '', type: 'Task', status: 'Done', projectId: 'proj2', workspaceId: 'ws1', createdAt: new Date(), attachments: [] },
  { id: `issue-${uuidv4()}`, title: 'Setup database schema', description: 'Define tables for users, projects, issues.', type: 'Task', status: 'ToDo', projectId: 'proj3', workspaceId: 'ws2', createdAt: new Date(), attachments: [] },
  { id: `issue-${uuidv4()}`, title: 'Define API endpoints for user profiles', description: 'CRUD operations for user data.', type: 'Epic', status: 'ToDo', projectId: 'proj3', workspaceId: 'ws2', createdAt: new Date(), attachments: [] },
];


const App = () => {
  // --- State Management ---
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);

  // --- Helper Getters ---
  const getWorkspaceById = useCallback((id: string | null) => workspaces.find(ws => ws.id === id) ?? null, [workspaces]);
  const getProjectById = useCallback((id: string | null) => projects.find(p => p.id === id) ?? null, [projects]);
  const getIssueById = useCallback((id: string | null) => issues.find(i => i.id === id) ?? null, [issues]);

  // --- Handlers ---

  // Workspace/Project Add/Delete
  const handleAddWorkspace = (name: string) => {
    const newWorkspace: Workspace = { id: uuidv4(), name };
    setWorkspaces(prev => [...prev, newWorkspace]);
    toast.success(`Workspace "${name}" created.`);
    return newWorkspace; // Return the new workspace for potential immediate selection
  };

  const handleAddProject = (name: string, workspaceId: string) => {
    const newProject: Project = { id: uuidv4(), name, workspaceId };
    setProjects(prev => [...prev, newProject]);
    toast.success(`Project "${name}" created.`);
    return newProject; // Return the new project for potential immediate selection
  };

  const handleDeleteWorkspace = (id: string, name: string) => {
    // Cascade delete: remove workspace, its projects, and their issues
    const projectsToDelete = projects.filter(p => p.workspaceId === id).map(p => p.id);
    setIssues(prev => prev.filter(i => !projectsToDelete.includes(i.projectId)));
    setProjects(prev => prev.filter(p => p.workspaceId !== id));
    setWorkspaces(prev => prev.filter(ws => ws.id !== id));
    toast.success(`Workspace "${name}" and its contents deleted.`);
    // Note: Selection reset logic will now live within the Index component
  };

  const handleDeleteProject = (id: string, name: string) => {
    // Cascade delete: remove project and its issues
    setIssues(prev => prev.filter(i => i.projectId !== id));
    setProjects(prev => prev.filter(p => p.id !== id));
    toast.success(`Project "${name}" and its issues deleted.`);
     // Note: Selection reset logic will now live within the Index component
  };

  // Issue Add/Update/Delete
   const handleAddIssue = (newIssueData: Omit<Issue, 'id' | 'createdAt'>) => {
    // Ensure projectId and workspaceId are present before adding
    if (!newIssueData.projectId || !newIssueData.workspaceId) {
        toast.error("Cannot add issue without Project and Workspace ID.");
        console.error("Missing projectId or workspaceId", newIssueData);
        return; // Prevent adding issue without necessary IDs
    }
    const newIssue: Issue = {
      ...newIssueData,
      id: `issue-${uuidv4()}`, // Ensure unique ID format
      createdAt: new Date(),
      attachments: newIssueData.attachments ?? [], // Ensure attachments is an array
    };
    setIssues(prev => [...prev, newIssue]);
    // Toast is handled in the dialog usually
  };

  const handleAddBulkIssues = (titles: string[], projectId: string, workspaceId: string) => {
    const newIssues: Issue[] = titles.map(title => ({
        id: `issue-${uuidv4()}`, // Ensure unique ID format
        title: title,
        description: '', // Default empty description
        type: 'Task',    // Default type
        status: 'ToDo',  // Default status
        projectId: projectId,
        workspaceId: workspaceId,
        createdAt: new Date(),
        attachments: [], // Default to empty array
    }));
    setIssues(prev => [...prev, ...newIssues]);
    toast.success(`${titles.length} issue(s) added successfully!`);
  };

  // Combined update function for various fields
  const handleUpdateIssue = (id: string, updates: Partial<Pick<Issue, 'title' | 'description' | 'type' | 'status'>>) => {
    setIssues(prevIssues =>
        prevIssues.map(issue =>
            issue.id === id ? { ...issue, ...updates } : issue
        )
    );
     // Optional: Add a generic success toast or handle in component
     // toast.success(`Issue updated.`);
  };

  const handleDeleteIssue = (id: string, name: string) => {
    setIssues(prev => prev.filter(i => i.id !== id));
    toast.success(`Issue "${name}" deleted.`);
  };

  // Attachment Handlers
  const handleAddAttachment = (issueId: string, file: File) => {
     // Basic size check (e.g., 10MB limit) - adjust as needed
     if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large (max 10MB).`);
        return;
     }
     const newAttachment: Attachment = {
        id: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file, // Store the File object (for local state demo)
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

  const handleDeleteAttachment = (issueId: string, attachmentId: string, attachmentName: string) => {
     setIssues(prevIssues =>
        prevIssues.map(issue =>
            issue.id === issueId
                ? { ...issue, attachments: issue.attachments?.filter(att => att.id !== attachmentId) ?? [] }
                : issue
        )
     );
     toast.success(`Attachment "${attachmentName}" deleted.`);
  };


  // Export Handler
  const handleExportIssues = (format: 'csv', projectId: string) => {
    const project = getProjectById(projectId);
    if (!project) {
        toast.error("Project not found for export.");
        return;
    }
    const issuesToExport = issues
        .filter(issue => issue.projectId === projectId)
        .map(issue => ({ // Select and format data for export
            ID: issue.id,
            Title: issue.title,
            Description: issue.description ?? '',
            Type: issue.type,
            Status: issue.status,
            Created: issue.createdAt.toISOString(), // Use ISO string for consistency
            Attachments: issue.attachments?.map(a => a.name).join(', ') ?? '', // Add attachment names
        }));

    if (issuesToExport.length === 0) {
        toast.info("No issues to export in this project.");
        return;
    }

    if (format === 'csv') {
        const worksheet = XLSX.utils.json_to_sheet(issuesToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Issues");
        // Generate filename: ProjectName_Issues_Date.xlsx
        const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const filename = `${project.name.replace(/ /g, '_')}_Issues_${dateStr}.xlsx`;
        XLSX.writeFile(workbook, filename);
        toast.success(`Issues exported to ${filename}`);
    }
    // Add other formats (PDF, Word) here later if needed
  };


  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster /> {/* Sonner toaster */}
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
                  onUpdateIssue={handleUpdateIssue} // Pass only the relevant part for inline editing
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
                    onUpdateIssue={handleUpdateIssue} // Pass the full update handler
                    onAddAttachment={handleAddAttachment}
                    onDeleteAttachment={handleDeleteAttachment}
                 />
              }
            />
            <Route path="*" element={<NotFound />} /> {/* Catch-all route */}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;