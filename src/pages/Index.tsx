import React, { useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import IssueList from '@/components/IssueList';
import AddIssueDialog from '@/components/AddIssueDialog';
import { Workspace, Project, Issue } from '@/types';
import { v4 as uuidv4 } from 'uuid'; // Need to install uuid
import { toast } from "sonner";

// Sample Data
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
  { id: uuidv4(), title: 'Button not working on login page', type: 'Bug', status: 'ToDo', projectId: 'proj1', workspaceId: 'ws1', createdAt: new Date() },
  { id: uuidv4(), title: 'Implement user authentication', type: 'Story', status: 'InProgress', projectId: 'proj1', workspaceId: 'ws1', createdAt: new Date() },
  { id: uuidv4(), title: 'Design new landing page mockups', type: 'Task', status: 'Done', projectId: 'proj2', workspaceId: 'ws1', createdAt: new Date() },
  { id: uuidv4(), title: 'Setup database schema', type: 'Task', status: 'ToDo', projectId: 'proj3', workspaceId: 'ws2', createdAt: new Date() },
  { id: uuidv4(), title: 'Define API endpoints for user profiles', type: 'Epic', status: 'ToDo', projectId: 'proj3', workspaceId: 'ws2', createdAt: new Date() },
];


const Index: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(initialWorkspaces[0]?.id ?? null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
      // Set initial project based on initial workspace
      const firstProjectInFirstWorkspace = initialProjects.find(p => p.workspaceId === initialWorkspaces[0]?.id);
      return firstProjectInFirstWorkspace?.id ?? null;
  });

  const [isAddIssueDialogOpen, setIsAddIssueDialogOpen] = useState(false);

  const handleSelectWorkspace = useCallback((id: string) => {
    setSelectedWorkspaceId(id);
    // Reset project selection when workspace changes, select first project in new workspace
    const firstProjectInWorkspace = projects.find(p => p.workspaceId === id);
    setSelectedProjectId(firstProjectInWorkspace?.id ?? null);
  }, [projects]);

  const handleSelectProject = useCallback((id: string) => {
    setSelectedProjectId(id);
  }, []);

  // --- Placeholder Add Functions ---
  const handleAddWorkspace = () => {
    const newWorkspaceName = prompt("Enter new workspace name:");
    if (newWorkspaceName?.trim()) {
        const newWorkspace: Workspace = { id: uuidv4(), name: newWorkspaceName.trim() };
        setWorkspaces(prev => [...prev, newWorkspace]);
        setSelectedWorkspaceId(newWorkspace.id); // Select the new workspace
        setSelectedProjectId(null); // Reset project selection
        toast.success(`Workspace "${newWorkspace.name}" created.`);
    } else if (newWorkspaceName !== null) { // Handle empty input but not cancel
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
        setSelectedProjectId(newProject.id); // Select the new project
        toast.success(`Project "${newProject.name}" created.`);
    } else if (newProjectName !== null) {
        toast.error("Project name cannot be empty.");
    }
  };
  // --- End Placeholder Add Functions ---

  const handleAddIssue = (newIssueData: Omit<Issue, 'id' | 'createdAt' | 'projectId' | 'workspaceId'>) => {
     if (!selectedProjectId || !selectedWorkspaceId) {
        console.error("Cannot add issue without selected project and workspace");
        toast.error("Internal error: Project or Workspace not selected.");
        return; // Should not happen if dialog is opened correctly
    }
    const newIssue: Issue = {
      ...newIssueData,
      id: uuidv4(),
      createdAt: new Date(),
      projectId: selectedProjectId,
      workspaceId: selectedWorkspaceId,
    };
    setIssues(prev => [...prev, newIssue]);
    // Toast is handled in the dialog component
  };


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
    />
  );

  const mainContent = (
    <div className="w-full h-full flex flex-col">
        <IssueList
            issues={issues}
            projectId={selectedProjectId}
            onAddIssue={() => setIsAddIssueDialogOpen(true)} // Open dialog on button click
        />
        {/* Add other main content components here */}
    </div>
  );

  return (
    <>
        <Layout sidebar={sidebarContent}>
            {mainContent}
        </Layout>
        <AddIssueDialog
            isOpen={isAddIssueDialogOpen}
            onOpenChange={setIsAddIssueDialogOpen}
            onAddIssue={handleAddIssue}
            projectId={selectedProjectId}
            workspaceId={selectedWorkspaceId}
        />
    </>
  );
};

export default Index;