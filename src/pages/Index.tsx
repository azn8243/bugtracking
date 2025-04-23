import React, { useState, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import IssueList from '@/components/IssueList';
import AddIssueDialog from '@/components/AddIssueDialog';
import BulkAddIssuesDialog from '@/components/BulkAddIssuesDialog';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Workspace, Project, Issue, IssueType, IssueStatus, Attachment } from '@/types'; // Import Attachment
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import * as XLSX from 'xlsx';

// Sample Data - Add empty attachments array to existing issues
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
  { id: uuidv4(), title: 'Button not working on login page', description: 'The main login button is unresponsive.', type: 'Bug', status: 'ToDo', projectId: 'proj1', workspaceId: 'ws1', createdAt: new Date(), attachments: [] },
  { id: uuidv4(), title: 'Implement user authentication', description: 'Setup JWT authentication flow.', type: 'Story', status: 'InProgress', projectId: 'proj1', workspaceId: 'ws1', createdAt: new Date(), attachments: [] },
  { id: uuidv4(), title: 'Design new landing page mockups', description: '', type: 'Task', status: 'Done', projectId: 'proj2', workspaceId: 'ws1', createdAt: new Date(), attachments: [] },
  { id: uuidv4(), title: 'Setup database schema', description: 'Define tables for users, projects, issues.', type: 'Task', status: 'ToDo', projectId: 'proj3', workspaceId: 'ws2', createdAt: new Date(), attachments: [] },
  { id: uuidv4(), title: 'Define API endpoints for user profiles', description: 'CRUD operations for user data.', type: 'Epic', status: 'ToDo', projectId: 'proj3', workspaceId: 'ws2', createdAt: new Date(), attachments: [] },
];

type DeletionTarget =
  | { type: 'workspace'; id: string; name: string }
  | { type: 'project'; id: string; name: string }
  | { type: 'issue'; id: string; name: string }
  | null;


const Index: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(initialWorkspaces[0]?.id ?? null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
      const firstProjectInFirstWorkspace = initialProjects.find(p => p.workspaceId === initialWorkspaces[0]?.id);
      return firstProjectInFirstWorkspace?.id ?? null;
  });

  const [isAddIssueDialogOpen, setIsAddIssueDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [deletionTarget, setDeletionTarget] = useState<DeletionTarget>(null);

  // --- Derived State for Names ---
  const selectedWorkspaceName = useMemo(() => {
    return workspaces.find(ws => ws.id === selectedWorkspaceId)?.name ?? null;
  }, [workspaces, selectedWorkspaceId]);

  const selectedProjectName = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId)?.name ?? null;
  }, [projects, selectedProjectId]);

  // --- Selection Handlers ---
  const handleSelectWorkspace = useCallback((id: string) => {
    setSelectedWorkspaceId(id);
    const firstProjectInWorkspace = projects.find(p => p.workspaceId === id);
    setSelectedProjectId(firstProjectInWorkspace?.id ?? null);
  }, [projects]);

  const handleSelectProject = useCallback((id: string) => {
    setSelectedProjectId(id);
  }, []);

  // --- Add Handlers ---
  const handleAddWorkspace = () => {
    const newWorkspaceName = prompt("Enter new workspace name:");
    if (newWorkspaceName?.trim()) {
        const newWorkspace: Workspace = { id: uuidv4(), name: newWorkspaceName.trim() };
        setWorkspaces(prev => [...prev, newWorkspace]);
        setSelectedWorkspaceId(newWorkspace.id);
        setSelectedProjectId(null);
        toast.success(`Workspace "${newWorkspace.name}" created.`);
    } else if (newWorkspaceName !== null) {
        toast.error("Workspace name cannot be empty.");
    }
  };

  const handleAddProject = () => {
    if (!selectedWorkspaceId) {
        toast.error("Please select a workspace first.");
        return;
    }
    const newProjectName = prompt("Enter new project name:");
     if (newProjectName?.trim()) {
        const newProject: Project = { id: uuidv4(), name: newProjectName.trim(), workspaceId: selectedWorkspaceId };
        setProjects(prev => [...prev, newProject]);
        setSelectedProjectId(newProject.id);
        toast.success(`Project "${newProject.name}" created.`);
    } else if (newProjectName !== null) {
        toast.error("Project name cannot be empty.");
    }
  };

  // Single Issue Add - Updated to handle attachments
  const handleAddIssue = (newIssueData: Omit<Issue, 'id' | 'createdAt' | 'projectId' | 'workspaceId'>) => {
     if (!selectedProjectId || !selectedWorkspaceId) {
        console.error("Cannot add issue without selected project and workspace");
        toast.error("Internal error: Project or Workspace not selected.");
        return;
    }
    const newIssue: Issue = {
      ...newIssueData, // Includes title, description, type, status, attachments?
      id: uuidv4(),
      createdAt: new Date(),
      projectId: selectedProjectId,
      workspaceId: selectedWorkspaceId,
      // Ensure attachments is an array, even if undefined from dialog
      attachments: newIssueData.attachments ?? [],
    };
    setIssues(prev => [...prev, newIssue]);
  };

  // Bulk Issue Add - Initialize with empty attachments
  const handleAddBulkIssues = (titles: string[]) => {
     if (!selectedProjectId || !selectedWorkspaceId) {
        console.error("Cannot add bulk issues without selected project and workspace");
        toast.error("Internal error: Project or Workspace not selected.");
        return;
    }
    const newIssues: Issue[] = titles.map(title => ({
        id: uuidv4(),
        title: title,
        description: '',
        type: 'Task',
        status: 'ToDo',
        projectId: selectedProjectId!,
        workspaceId: selectedWorkspaceId!,
        createdAt: new Date(),
        attachments: [], // Initialize with empty attachments
    }));
    setIssues(prev => [...prev, ...newIssues]);
  };

  // --- Update Handler ---
  // Note: This doesn't handle updating attachments yet.
  const handleUpdateIssue = (id: string, field: 'type' | 'status', value: IssueType | IssueStatus) => {
    setIssues(prevIssues =>
        prevIssues.map(issue =>
            issue.id === id ? { ...issue, [field]: value } : issue
        )
    );
  };


  // --- Delete Handlers ---
  const requestDeleteWorkspace = (id: string) => {
    const workspace = workspaces.find(ws => ws.id === id);
    if (workspace) {
        setDeletionTarget({ type: 'workspace', id, name: workspace.name });
    }
  };

  const requestDeleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
        setDeletionTarget({ type: 'project', id, name: project.name });
    }
  };

  const requestDeleteIssue = (id: string) => {
     const issue = issues.find(i => i.id === id);
     if (issue) {
        setDeletionTarget({ type: 'issue', id, name: issue.title });
     }
  };

  const confirmDeletion = () => {
    if (!deletionTarget) return;
    const { type, id, name } = deletionTarget;

    if (type === 'workspace') {
        const projectsToDelete = projects.filter(p => p.workspaceId === id).map(p => p.id);
        setIssues(prev => prev.filter(i => !projectsToDelete.includes(i.projectId)));
        setProjects(prev => prev.filter(p => p.workspaceId !== id));
        setWorkspaces(prev => prev.filter(ws => ws.id !== id));
        toast.success(`Workspace "${name}" and its contents deleted.`);
        if (selectedWorkspaceId === id) {
            const nextWorkspace = workspaces.find(ws => ws.id !== id);
            setSelectedWorkspaceId(nextWorkspace?.id ?? null);
            const firstProjectInNextWorkspace = projects.find(p => p.workspaceId === nextWorkspace?.id);
            setSelectedProjectId(firstProjectInNextWorkspace?.id ?? null);
        }
    } else if (type === 'project') {
        setIssues(prev => prev.filter(i => i.projectId !== id));
        setProjects(prev => prev.filter(p => p.id !== id));
        toast.success(`Project "${name}" and its issues deleted.`);
        if (selectedProjectId === id) {
             setSelectedProjectId(null);
        }
    } else if (type === 'issue') {
        setIssues(prev => prev.filter(i => i.id !== id));
        toast.success(`Issue "${name}" deleted.`);
    }
    setDeletionTarget(null);
  };

  // --- Export Handler ---
  const handleExportIssues = (format: 'csv') => {
    if (!selectedProjectId || !selectedProjectName) {
        toast.error("Please select a project to export issues.");
        return;
    }
    const issuesToExport = issues
        .filter(issue => issue.projectId === selectedProjectId)
        .map(issue => ({
            ID: issue.id,
            Title: issue.title,
            Description: issue.description ?? '',
            Type: issue.type,
            Status: issue.status,
            Created: issue.createdAt.toISOString(),
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
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `${selectedProjectName.replace(/ /g, '_')}_Issues_${dateStr}.xlsx`;
        XLSX.writeFile(workbook, filename);
        toast.success(`Issues exported to ${filename}`);
    }
  };


  // --- Render ---
  const sidebarContent = (
    <Sidebar
      workspaces={workspaces}
      projects={projects}
      selectedWorkspaceId={selectedWorkspaceId}
      selectedProjectId={selectedProjectId}
      onSelectWorkspace={handleSelectWorkspace}
      onSelectProject={handleSelectProject}
      onAddWorkspace={handleAddWorkspace}
      onAddProject={handleAddProject}
      onDeleteWorkspace={requestDeleteWorkspace}
      onDeleteProject={requestDeleteProject}
    />
  );

  const mainContent = (
    <IssueList
        issues={issues}
        projectId={selectedProjectId}
        workspaceName={selectedWorkspaceName}
        projectName={selectedProjectName}
        onAddIssue={() => setIsAddIssueDialogOpen(true)}
        onAddBulkIssues={() => setIsBulkAddDialogOpen(true)}
        onDeleteIssue={requestDeleteIssue}
        onExportIssues={handleExportIssues}
        onUpdateIssue={handleUpdateIssue}
    />
  );

  return (
    <>
        <Layout sidebar={sidebarContent}>
            {mainContent}
        </Layout>
        {/* Single Add Dialog */}
        <AddIssueDialog
            isOpen={isAddIssueDialogOpen}
            onOpenChange={setIsAddIssueDialogOpen}
            onAddIssue={handleAddIssue}
            projectId={selectedProjectId}
            workspaceId={selectedWorkspaceId}
        />
        {/* Bulk Add Dialog */}
        <BulkAddIssuesDialog
            isOpen={isBulkAddDialogOpen}
            onOpenChange={setIsBulkAddDialogOpen}
            onAddBulkIssues={handleAddBulkIssues}
            projectId={selectedProjectId}
        />
        {/* Confirmation Dialog */}
        <ConfirmationDialog
            isOpen={!!deletionTarget}
            onOpenChange={(open) => !open && setDeletionTarget(null)}
            onConfirm={confirmDeletion}
            title={`Delete ${deletionTarget?.type ?? ''}?`}
            description={
                deletionTarget?.type === 'workspace'
                ? `Are you sure you want to delete the workspace "${deletionTarget.name}"? This will also delete all projects and issues within it. This action cannot be undone.`
                : deletionTarget?.type === 'project'
                ? `Are you sure you want to delete the project "${deletionTarget.name}"? This will also delete all issues within it. This action cannot be undone.`
                : `Are you sure you want to delete the issue "${deletionTarget?.name ?? ''}"? This action cannot be undone.`
            }
        />
    </>
  );
};

export default Index;