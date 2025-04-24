import React, { useState, useCallback } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import IssueDetail from "./pages/IssueDetail";
import NotFound from "./pages/NotFound";
// Import IssuePriority
import { Workspace, Project, Issue, IssueType, IssueStatus, IssuePriority, Attachment, ActivityLog, ActivityAction } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { toast } from "sonner";

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
// Add default priority to initial issues
const initialIssues: Issue[] = [
  { id: `issue-${uuidv4()}`, title: 'Button not working on login page', description: 'The main login button is unresponsive.', type: 'Bug', status: 'ToDo', priority: 'High', projectId: 'proj1', workspaceId: 'ws1', createdAt: new Date(), updatedAt: new Date(), attachments: [] },
  { id: `issue-${uuidv4()}`, title: 'Implement user authentication', description: 'Setup JWT authentication flow.', type: 'Story', status: 'InProgress', priority: 'Medium', projectId: 'proj1', workspaceId: 'ws1', createdAt: new Date(), updatedAt: new Date(), attachments: [] },
  { id: `issue-${uuidv4()}`, title: 'Design new landing page mockups', description: '', type: 'Task', status: 'Done', priority: 'Low', projectId: 'proj2', workspaceId: 'ws1', createdAt: new Date(), updatedAt: new Date(), attachments: [] },
  { id: `issue-${uuidv4()}`, title: 'Setup database schema', description: 'Define tables for users, projects, issues.', type: 'Task', status: 'ToDo', priority: 'Medium', projectId: 'proj3', workspaceId: 'ws2', createdAt: new Date(), updatedAt: new Date(), attachments: [] },
  { id: `issue-${uuidv4()}`, title: 'Define API endpoints for user profiles', description: 'CRUD operations for user data.', type: 'Epic', status: 'ToDo', priority: 'Medium', projectId: 'proj3', workspaceId: 'ws2', createdAt: new Date(), updatedAt: new Date(), attachments: [] },
];


const App = () => {
  // --- State Management ---
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // --- Helper Getters ---
  const getWorkspaceById = useCallback((id: string | null) => workspaces.find(ws => ws.id === id) ?? null, [workspaces]);
  const getProjectById = useCallback((id: string | null) => projects.find(p => p.id === id) ?? null, [projects]);
  const getIssueById = useCallback((id: string | null) => issues.find(i => i.id === id) ?? null, [issues]);

  // --- Activity Logging Function ---
  const logActivity = (action: ActivityAction, details: ActivityLog['details']) => {
    const newLog: ActivityLog = {
      id: uuidv4(), action, timestamp: new Date(), details,
    };
    setActivityLogs(prev => [newLog, ...prev]);
    console.log("Activity Logged:", newLog);
  };


  // --- Handlers (Modified to Log Activity) ---

  const handleAddWorkspace = (name: string) => {
    const newWorkspace: Workspace = { id: uuidv4(), name };
    setWorkspaces(prev => [...prev, newWorkspace]);
    logActivity('CREATE_WORKSPACE', { workspaceId: newWorkspace.id, workspaceName: newWorkspace.name });
    toast.success(`Workspace "${name}" created.`);
    return newWorkspace;
  };

  const handleAddProject = (name: string, workspaceId: string) => {
    const workspace = getWorkspaceById(workspaceId);
    const newProject: Project = { id: uuidv4(), name, workspaceId };
    setProjects(prev => [...prev, newProject]);
    logActivity('CREATE_PROJECT', { projectId: newProject.id, projectName: newProject.name, workspaceId: workspaceId, workspaceName: workspace?.name });
    toast.success(`Project "${name}" created.`);
    return newProject;
  };

  const handleDeleteWorkspace = (id: string, name: string) => {
    const projectsToDelete = projects.filter(p => p.workspaceId === id).map(p => p.id);
    setIssues(prev => prev.filter(i => !projectsToDelete.includes(i.projectId)));
    setProjects(prev => prev.filter(p => p.workspaceId !== id));
    setWorkspaces(prev => prev.filter(ws => ws.id !== id));
    logActivity('DELETE_WORKSPACE', { workspaceId: id, workspaceName: name });
    toast.success(`Workspace "${name}" and its contents deleted.`);
  };

  const handleDeleteProject = (id: string, name: string) => {
    const project = getProjectById(id);
    const workspace = project ? getWorkspaceById(project.workspaceId) : null;
    setIssues(prev => prev.filter(i => i.projectId !== id));
    setProjects(prev => prev.filter(p => p.id !== id));
    logActivity('DELETE_PROJECT', { projectId: id, projectName: name, workspaceId: workspace?.id, workspaceName: workspace?.name });
    toast.success(`Project "${name}" and its issues deleted.`);
  };

   const handleAddIssue = (newIssueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!newIssueData.projectId || !newIssueData.workspaceId) {
        toast.error("Cannot add issue without Project and Workspace ID."); return;
    }
    const now = new Date();
    const newIssue: Issue = {
      priority: 'Medium', // Default priority
      ...newIssueData,
      id: `issue-${uuidv4()}`,
      createdAt: now,
      updatedAt: now,
      attachments: newIssueData.attachments ?? [],
    };
    setIssues(prev => [...prev, newIssue]);
    const project = getProjectById(newIssue.projectId);
    logActivity('CREATE_ISSUE', { issueId: newIssue.id, issueTitle: newIssue.title, projectId: newIssue.projectId, projectName: project?.name, workspaceId: newIssue.workspaceId });
  };

  const handleAddBulkIssues = (titles: string[], projectId: string, workspaceId: string) => {
    const now = new Date();
    const project = getProjectById(projectId);
    const newIssues: Issue[] = titles.map(title => ({
        id: `issue-${uuidv4()}`,
        title: title,
        description: '',
        type: 'Task',
        status: 'ToDo',
        priority: 'Medium', // Default priority
        projectId: projectId,
        workspaceId: workspaceId,
        createdAt: now,
        updatedAt: now,
        attachments: [],
    }));
    setIssues(prev => [...prev, ...newIssues]);
    newIssues.forEach(issue => {
        logActivity('CREATE_ISSUE', { issueId: issue.id, issueTitle: issue.title, projectId: issue.projectId, projectName: project?.name, workspaceId: issue.workspaceId });
    });
    toast.success(`${titles.length} issue(s) added successfully!`);
  };

  // Update handler now includes priority
  const handleUpdateIssue = (id: string, updates: Partial<Pick<Issue, 'title' | 'description' | 'type' | 'status' | 'priority'>>) => {
    const issueToUpdate = getIssueById(id);
    if (!issueToUpdate) return;

    const updatedIssue = { ...issueToUpdate, ...updates, updatedAt: new Date() };

    setIssues(prevIssues =>
        prevIssues.map(issue =>
            issue.id === id ? updatedIssue : issue
        )
    );

    // Log specific field changes
    Object.entries(updates).forEach(([key, newValue]) => {
        const oldValue = issueToUpdate[key as keyof typeof updates];
        if (oldValue !== newValue) {
            let action: ActivityAction | null = null;
            switch (key) {
                case 'title': action = 'UPDATE_ISSUE_TITLE'; break;
                case 'description': action = 'UPDATE_ISSUE_DESC'; break;
                case 'type': action = 'UPDATE_ISSUE_TYPE'; break;
                case 'status': action = 'UPDATE_ISSUE_STATUS'; break;
                case 'priority': action = 'UPDATE_ISSUE_PRIORITY'; break; // Log priority change
            }
            if (action) {
                logActivity(action, {
                    issueId: id,
                    issueTitle: updatedIssue.title,
                    projectId: issueToUpdate.projectId,
                    workspaceId: issueToUpdate.workspaceId,
                    fieldName: key,
                    oldValue: String(oldValue ?? ''),
                    newValue: String(newValue ?? ''),
                });
            }
        }
    });
  };

  const handleDeleteIssue = (id: string, name: string) => {
    const issue = getIssueById(id);
    if (!issue) return;
    setIssues(prev => prev.filter(i => i.id !== id));
    logActivity('DELETE_ISSUE', { issueId: id, issueTitle: name, projectId: issue.projectId, workspaceId: issue.workspaceId });
    toast.success(`Issue "${name}" deleted.`);
  };

  const handleAddAttachment = (issueId: string, file: File) => {
     if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large (max 10MB).`); return;
     }
     const issue = getIssueById(issueId);
     if (!issue) return;
     const newAttachment: Attachment = { id: uuidv4(), name: file.name, size: file.size, type: file.type, file: file };
     const now = new Date();
     setIssues(prevIssues =>
        prevIssues.map(i => i.id === issueId ? { ...i, attachments: [...(i.attachments ?? []), newAttachment], updatedAt: now } : i)
     );
     logActivity('ADD_ATTACHMENT', { issueId: issueId, issueTitle: issue.title, projectId: issue.projectId, workspaceId: issue.workspaceId, attachmentName: newAttachment.name });
     toast.success(`Attachment "${file.name}" added.`);
  };

  const handleDeleteAttachment = (issueId: string, attachmentId: string, attachmentName: string) => {
     const issue = getIssueById(issueId);
     if (!issue) return;
     const now = new Date();
     setIssues(prevIssues =>
        prevIssues.map(i => i.id === issueId ? { ...i, attachments: i.attachments?.filter(att => att.id !== attachmentId) ?? [], updatedAt: now } : i)
     );
     logActivity('DELETE_ATTACHMENT', { issueId: issueId, issueTitle: issue.title, projectId: issue.projectId, workspaceId: issue.workspaceId, attachmentName: attachmentName });
     toast.success(`Attachment "${attachmentName}" deleted.`);
  };


  // Export Handler - Add Priority column
  const handleExportIssues = (format: 'csv', projectId: string) => {
    const project = getProjectById(projectId);
    if (!project) { toast.error("Project not found for export."); return; }
    const issuesToExport = issues
        .filter(issue => issue.projectId === projectId)
        .map(issue => ({
            ID: issue.id, Title: issue.title, Description: issue.description ?? '', Type: issue.type, Status: issue.status, Priority: issue.priority, Created: issue.createdAt.toISOString(), Updated: issue.updatedAt?.toISOString() ?? '', Attachments: issue.attachments?.map(a => a.name).join(', ') ?? '',
        }));
    if (issuesToExport.length === 0) { toast.info("No issues to export in this project."); return; }
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
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Index
                  workspaces={workspaces}
                  projects={projects}
                  issues={issues}
                  activityLogs={activityLogs}
                  getWorkspaceById={getWorkspaceById}
                  getProjectById={getProjectById}
                  getIssueById={getIssueById}
                  onAddWorkspace={handleAddWorkspace}
                  onAddProject={handleAddProject}
                  onDeleteWorkspace={handleDeleteWorkspace}
                  onDeleteProject={handleDeleteProject}
                  onAddIssue={handleAddIssue}
                  onAddBulkIssues={handleAddBulkIssues}
                  // Pass specific update handler for list view (type, status, priority)
                  onUpdateIssue={(id, updates) => handleUpdateIssue(id, updates)}
                  onDeleteIssue={handleDeleteIssue}
                  onExportIssues={handleExportIssues}
                />
              }
            />
            <Route
              path="/issue/:issueId"
              element={
                <IssueDetail
                    getIssueById={getIssueById}
                    getWorkspaceById={getWorkspaceById}
                    getProjectById={getProjectById}
                    onUpdateIssue={handleUpdateIssue} // Pass full update handler
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