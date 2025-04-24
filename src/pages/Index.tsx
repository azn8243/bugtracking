import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import IssueList from '@/components/IssueList';
import AddIssueDialog from '@/components/AddIssueDialog';
import BulkAddIssuesDialog from '@/components/BulkAddIssuesDialog';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Workspace, Project, Issue, IssueType, IssueStatus, ActivityLog } from '@/types';
import { toast } from "sonner";

type DeletionTarget =
  | { type: 'workspace'; id: string; name: string }
  | { type: 'project'; id: string; name: string }
  | { type: 'issue'; id: string; name: string }
  | null;

interface IndexProps {
  workspaces: Workspace[];
  projects: Project[];
  issues: Issue[];
  activityLogs: ActivityLog[];
  getWorkspaceById: (id: string | null) => Workspace | null;
  getProjectById: (id: string | null) => Project | null;
  getIssueById: (id: string | null) => Issue | null;
  onAddWorkspace: (name: string) => Workspace;
  onAddProject: (name: string, workspaceId: string) => Project;
  onDeleteWorkspace: (id: string, name: string) => void;
  onDeleteProject: (id: string, name: string) => void;
  onAddIssue: (newIssueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddBulkIssues: (titles: string[], projectId: string, workspaceId: string) => void;
  onUpdateIssue: (id: string, updates: Partial<Pick<Issue, 'type' | 'status'>>) => void;
  onDeleteIssue: (id: string, name: string) => void;
  onExportIssues: (format: 'csv', projectId: string) => void;
}

const Index: React.FC<IndexProps> = ({
  workspaces,
  projects,
  issues,
  activityLogs,
  getWorkspaceById,
  getProjectById,
  getIssueById,
  onAddWorkspace,
  onAddProject,
  onDeleteWorkspace,
  onDeleteProject,
  onAddIssue,
  onAddBulkIssues,
  onUpdateIssue,
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
    if (!selectedWorkspaceId && workspaces.length > 0) {
      const initialWsId = workspaces[0].id;
      setSelectedWorkspaceId(initialWsId);
      const firstProjectInWs = projects.find(p => p.workspaceId === initialWsId);
      setSelectedProjectId(firstProjectInWs?.id ?? null);
    }
    else if (selectedWorkspaceId && !workspaces.find(ws => ws.id === selectedWorkspaceId)) {
        const nextWorkspace = workspaces[0];
        setSelectedWorkspaceId(nextWorkspace?.id ?? null);
        const firstProjectInNextWs = projects.find(p => p.workspaceId === nextWorkspace?.id);
        setSelectedProjectId(firstProjectInNextWs?.id ?? null);
    }
    else if (selectedProjectId && (!projects.find(p => p.id === selectedProjectId) || projects.find(p => p.id === selectedProjectId)?.workspaceId !== selectedWorkspaceId)) {
        const firstProjectInCurrentWs = projects.find(p => p.workspaceId === selectedWorkspaceId);
        setSelectedProjectId(firstProjectInCurrentWs?.id ?? null);
    }
  }, [workspaces, projects, selectedWorkspaceId, selectedProjectId]);

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
  const handleLocalAddWorkspace = () => {
    const newWorkspaceName = prompt("Enter new workspace name:");
    if (newWorkspaceName?.trim()) {
        const newWorkspace = onAddWorkspace(newWorkspaceName.trim());
        setSelectedWorkspaceId(newWorkspace.id);
        setSelectedProjectId(null);
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
        const newProject = onAddProject(newProjectName.trim(), selectedWorkspaceId);
        setSelectedProjectId(newProject.id);
    } else if (newProjectName !== null) {
        toast.error("Project name cannot be empty.");
    }
  };

  // --- Delete Handlers ---
  const requestDeleteWorkspace = (id: string) => {
    const workspace = workspaces.find(ws => ws.id === id);
    if (workspace) setDeletionTarget({ type: 'workspace', id, name: workspace.name });
  };

  const requestDeleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) setDeletionTarget({ type: 'project', id, name: project.name });
  };

  const requestDeleteIssue = (id: string) => {
     const issue = issues.find(i => i.id === id);
     if (issue) setDeletionTarget({ type: 'issue', id, name: issue.title });
  };

  const confirmDeletion = () => {
    if (!deletionTarget) return;
    const { type, id, name } = deletionTarget;
    if (type === 'workspace') onDeleteWorkspace(id, name);
    else if (type === 'project') onDeleteProject(id, name);
    else if (type === 'issue') onDeleteIssue(id, name);
    setDeletionTarget(null);
  };

  // --- Issue Add Handlers ---
   const handleLocalAddIssue = (newIssueData: Omit<Issue, 'id' | 'createdAt' | 'projectId' | 'workspaceId' | 'updatedAt'>) => {
     if (!selectedProjectId || !selectedWorkspaceId) {
        toast.error("Cannot add issue: Project or Workspace not selected.");
        return;
    }
     onAddIssue({ ...newIssueData, projectId: selectedProjectId, workspaceId: selectedWorkspaceId });
   };

   const handleLocalAddBulkIssues = (titles: string[]) => {
      if (!selectedProjectId || !selectedWorkspaceId) {
        toast.error("Cannot add bulk issues: Project or Workspace not selected.");
        return;
    }
      onAddBulkIssues(titles, selectedProjectId, selectedWorkspaceId);
   };

   // --- Export Handler ---
   const handleLocalExportIssues = (format: 'csv') => {
     if (!selectedProjectId) {
        toast.error("Please select a project to export.");
        return;
     }
     onExportIssues(format, selectedProjectId);
   };

   // --- Update Handler ---
   const handleLocalUpdateIssue = (id: string, updates: Partial<Pick<Issue, 'type' | 'status'>>) => {
       onUpdateIssue(id, updates);
   };

  // --- Construct sidebar content ---
  const sidebarContent = (
    <Sidebar
      workspaces={workspaces}
      projects={projects}
      issues={issues}
      selectedWorkspaceId={selectedWorkspaceId}
      selectedProjectId={selectedProjectId}
      onSelectWorkspace={handleSelectWorkspace}
      onSelectProject={handleSelectProject}
      onAddWorkspace={handleLocalAddWorkspace}
      onAddProject={handleLocalAddProject}
      onDeleteWorkspace={requestDeleteWorkspace}
      onDeleteProject={requestDeleteProject}
    />
  );

  // --- Construct main content ---
  const mainContent = (
    <IssueList
      issues={issues}
      projectId={selectedProjectId}
      workspaceName={selectedWorkspaceName}
      projectName={selectedProjectName}
      onAddIssue={() => setIsAddIssueDialogOpen(true)}
      onAddBulkIssues={() => setIsBulkAddDialogOpen(true)}
      onDeleteIssue={requestDeleteIssue}
      onExportIssues={handleLocalExportIssues}
      onUpdateIssue={handleLocalUpdateIssue}
    />
  );

  return (
    <>
      <Layout sidebar={sidebarContent}>
        {mainContent}
      </Layout>
      <AddIssueDialog
        isOpen={isAddIssueDialogOpen}
        onOpenChange={setIsAddIssueDialogOpen}
        onAddIssue={handleLocalAddIssue}
        projectId={selectedProjectId}
        workspaceId={selectedWorkspaceId}
      />
      <BulkAddIssuesDialog
        isOpen={isBulkAddDialogOpen}
        onOpenChange={setIsBulkAddDialogOpen}
        onAddBulkIssues={handleLocalAddBulkIssues}
        projectId={selectedProjectId}
      />
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