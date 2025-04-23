import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import IssueList from '@/components/IssueList';
import AddIssueDialog from '@/components/AddIssueDialog';
import BulkAddIssuesDialog from '@/components/BulkAddIssuesDialog';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Workspace, Project, Issue, IssueType, IssueStatus } from '@/types';
import { toast } from "sonner";

// Type for managing confirmation dialog state (local to Index)
type DeletionTarget =
  | { type: 'workspace'; id: string; name: string }
  | { type: 'project'; id: string; name: string }
  | { type: 'issue'; id: string; name: string }
  | null;

// Props interface matching handlers passed from App.tsx
interface IndexProps {
  workspaces: Workspace[];
  projects: Project[];
  issues: Issue[];
  onAddWorkspace: (name: string) => Workspace;
  onAddProject: (name: string, workspaceId: string) => Project;
  onDeleteWorkspace: (id: string, name: string) => void;
  onDeleteProject: (id: string, name: string) => void;
  onAddIssue: (newIssueData: Omit<Issue, 'id' | 'createdAt'>) => void;
  onAddBulkIssues: (titles: string[], projectId: string, workspaceId: string) => void;
  // Update signature to match what IssueList needs (only type/status)
  onUpdateIssue: (id: string, updates: Partial<Pick<Issue, 'type' | 'status'>>) => void;
  onDeleteIssue: (id: string, name: string) => void;
  onExportIssues: (format: 'csv', projectId: string) => void;
}

const Index: React.FC<IndexProps> = ({
  workspaces,
  projects,
  issues,
  onAddWorkspace,
  onAddProject,
  onDeleteWorkspace,
  onDeleteProject,
  onAddIssue,
  onAddBulkIssues,
  onUpdateIssue, // Receive the specific update handler for list view
  onDeleteIssue,
  onExportIssues,
}) => {
  // --- Local State for UI ---
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAddIssueDialogOpen, setIsAddIssueDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [deletionTarget, setDeletionTarget] = useState<DeletionTarget>(null);

  // --- Initialize Selection ---
  useEffect(() => {
    // Set initial workspace selection only if not already set and workspaces exist
    if (!selectedWorkspaceId && workspaces.length > 0) {
      const initialWsId = workspaces[0].id;
      setSelectedWorkspaceId(initialWsId);
      // Set initial project based on the first workspace
      const firstProjectInWs = projects.find(p => p.workspaceId === initialWsId);
      setSelectedProjectId(firstProjectInWs?.id ?? null);
    }
     // If selected workspace is deleted, reset selection
     else if (selectedWorkspaceId && !workspaces.find(ws => ws.id === selectedWorkspaceId)) {
        const nextWorkspace = workspaces[0];
        setSelectedWorkspaceId(nextWorkspace?.id ?? null);
        const firstProjectInNextWs = projects.find(p => p.workspaceId === nextWorkspace?.id);
        setSelectedProjectId(firstProjectInNextWs?.id ?? null);
     }
     // If selected project is deleted or workspace changed, reset project selection
     else if (selectedProjectId && (!projects.find(p => p.id === selectedProjectId) || projects.find(p => p.id === selectedProjectId)?.workspaceId !== selectedWorkspaceId)) {
        const firstProjectInCurrentWs = projects.find(p => p.workspaceId === selectedWorkspaceId);
        setSelectedProjectId(firstProjectInCurrentWs?.id ?? null);
     }

  }, [workspaces, projects, selectedWorkspaceId, selectedProjectId]); // Re-run on data changes


  // --- Derived State for Names (using props) ---
  const selectedWorkspaceName = useMemo(() => {
    return workspaces.find(ws => ws.id === selectedWorkspaceId)?.name ?? null;
  }, [workspaces, selectedWorkspaceId]);

  const selectedProjectName = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId)?.name ?? null;
  }, [projects, selectedProjectId]);

  // --- Selection Handlers (Local State) ---
  const handleSelectWorkspace = useCallback((id: string) => {
    setSelectedWorkspaceId(id);
    // Reset project selection when workspace changes, select first project in new workspace
    const firstProjectInWorkspace = projects.find(p => p.workspaceId === id);
    setSelectedProjectId(firstProjectInWorkspace?.id ?? null);
  }, [projects]); // Depend only on projects

  const handleSelectProject = useCallback((id: string) => {
    setSelectedProjectId(id);
  }, []);

  // --- Add Handlers (Call props, manage local selection) ---
  const handleLocalAddWorkspace = () => {
    const newWorkspaceName = prompt("Enter new workspace name:");
    if (newWorkspaceName?.trim()) {
        const newWorkspace = onAddWorkspace(newWorkspaceName.trim()); // Call prop handler
        setSelectedWorkspaceId(newWorkspace.id); // Update local selection
        setSelectedProjectId(null); // Reset project selection
    } else if (newWorkspaceName !== null) {
        toast.error("Workspace name cannot be empty.");
    }
  };

  const handleLocalAddProject = () => {
    if (!selectedWorkspaceId) {
        toast.error("Please select a workspace first.");
        return;
    }
    const newProjectName = prompt("Enter new project name:");
     if (newProjectName?.trim()) {
        const newProject = onAddProject(newProjectName.trim(), selectedWorkspaceId); // Call prop handler
        setSelectedProjectId(newProject.id); // Update local selection
    } else if (newProjectName !== null) {
        toast.error("Project name cannot be empty.");
    }
  };

  // --- Delete Handlers (Setup confirmation, call props) ---
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

    // Call the appropriate handler from props
    if (type === 'workspace') {
        onDeleteWorkspace(id, name);
        // Selection reset is handled by useEffect now
    } else if (type === 'project') {
        onDeleteProject(id, name);
         // Selection reset is handled by useEffect now
    } else if (type === 'issue') {
        onDeleteIssue(id, name); // Call prop handler
    }
    setDeletionTarget(null); // Close dialog
  };

  // --- Issue Add Handlers (Call props) ---
   const handleLocalAddIssue = (newIssueData: Omit<Issue, 'id' | 'createdAt' | 'projectId' | 'workspaceId'>) => {
     if (!selectedProjectId || !selectedWorkspaceId) {
        toast.error("Cannot add issue: Project or Workspace not selected.");
        return;
    }
     // Add the necessary IDs before calling the prop handler
     onAddIssue({ ...newIssueData, projectId: selectedProjectId, workspaceId: selectedWorkspaceId });
   };

   const handleLocalAddBulkIssues = (titles: string[]) => {
      if (!selectedProjectId || !selectedWorkspaceId) {
        toast.error("Cannot add bulk issues: Project or Workspace not selected.");
        return;
    }
      onAddBulkIssues(titles, selectedProjectId, selectedWorkspaceId);
   };

   // --- Export Handler (Call props) ---
   const handleLocalExportIssues = (format: 'csv') => {
     if (!selectedProjectId) {
        toast.error("Please select a project to export.");
        return;
     }
     onExportIssues(format, selectedProjectId);
   };

   // --- Update Handler (Call props) ---
   // This function now directly matches the prop signature needed by IssueList
   const handleLocalUpdateIssue = (id: string, updates: Partial<Pick<Issue, 'type' | 'status'>>) => {
       onUpdateIssue(id, updates);
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
      onAddWorkspace={handleLocalAddWorkspace} // Use local handlers
      onAddProject={handleLocalAddProject}     // Use local handlers
      onDeleteWorkspace={requestDeleteWorkspace} // Use local request handlers
      onDeleteProject={requestDeleteProject}     // Use local request handlers
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
        onDeleteIssue={requestDeleteIssue} // Use local request handler
        onExportIssues={handleLocalExportIssues} // Use local handler
        onUpdateIssue={handleLocalUpdateIssue} // Pass the correctly scoped update handler
    />
  );

  return (
    <>
        <Layout sidebar={sidebarContent}>
            {mainContent}
        </Layout>
        {/* Dialogs remain controlled by local state */}
        <AddIssueDialog
            isOpen={isAddIssueDialogOpen}
            onOpenChange={setIsAddIssueDialogOpen}
            onAddIssue={handleLocalAddIssue} // Use local handler
            projectId={selectedProjectId}
            workspaceId={selectedWorkspaceId}
        />
        <BulkAddIssuesDialog
            isOpen={isBulkAddDialogOpen}
            onOpenChange={setIsBulkAddDialogOpen}
            onAddBulkIssues={handleLocalAddBulkIssues} // Use local handler
            projectId={selectedProjectId}
        />
        <ConfirmationDialog
            isOpen={!!deletionTarget}
            onOpenChange={(open) => !open && setDeletionTarget(null)}
            onConfirm={confirmDeletion} // Calls prop handlers internally
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