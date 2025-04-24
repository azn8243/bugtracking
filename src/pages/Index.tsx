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

const IndexPage: React.FC<IndexProps> = ({
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
  // ... rest of the component implementation ...
  // (Keep all the existing code from your Index.tsx file here)

  return (
    <>
      <Layout sidebar={sidebarContent}>
        {mainContent}
      </Layout>
      {/* Dialogs remain controlled by local state */}
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

export default IndexPage; // Make sure this default export exists