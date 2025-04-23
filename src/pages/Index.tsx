import { useState } from 'react';
import Layout from '@/components/Layout';
import WorkspaceProjectSelector from '@/components/WorkspaceProjectSelector';
import IssueList from '@/components/IssueList';
import { AppData, Workspace, Project, Issue } from '@/types'; // Assuming types are defined
import { Button } from '@/components/ui/button'; // Example import

// Mock Data - Replace with actual data fetching/state management later
const initialData: AppData = {
  workspaces: [
    { id: 'ws1', name: 'My Software Co', createdAt: new Date() },
    { id: 'ws2', name: 'Personal Projects', createdAt: new Date() },
  ],
  projects: [
    { id: 'proj1', name: 'Frontend App', workspaceId: 'ws1', createdAt: new Date() },
    { id: 'proj2', name: 'Backend API', workspaceId: 'ws1', createdAt: new Date() },
    { id: 'proj3', name: 'Blog Site', workspaceId: 'ws2', createdAt: new Date() },
  ],
  issues: [
    { id: 'bug-001', title: 'Login button unresponsive', type: 'Bug', status: 'ToDo', projectId: 'proj1', workspaceId: 'ws1', createdAt: new Date(), updatedAt: new Date() },
    { id: 'story-001', title: 'User Authentication Flow', type: 'Story', status: 'InProgress', projectId: 'proj1', workspaceId: 'ws1', createdAt: new Date(), updatedAt: new Date() },
    { id: 'task-001', title: 'Implement JWT validation', type: 'Task', status: 'ToDo', projectId: 'proj2', workspaceId: 'ws1', parentId: 'story-001', createdAt: new Date(), updatedAt: new Date() },
    { id: 'epic-001', title: 'Q3 Feature Release', type: 'Epic', status: 'ToDo', projectId: 'proj1', workspaceId: 'ws1', createdAt: new Date(), updatedAt: new Date() },
     { id: 'bug-002', title: 'Typo on landing page', type: 'Bug', status: 'Done', projectId: 'proj3', workspaceId: 'ws2', createdAt: new Date(), updatedAt: new Date() },
  ],
};


const Index = () => {
  const [appData, setAppData] = useState<AppData>(initialData); // Manage state here for now
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleProjectSelect = (projectId: string | null) => {
    setSelectedProjectId(projectId);
  };

  const handleAddIssue = () => {
    // TODO: Implement logic to open an "Add Issue" dialog/form
    console.log("Add Issue button clicked for project:", selectedProjectId);
    alert("Add Issue functionality not yet implemented.");
  };

  const sidebarContent = (
    <WorkspaceProjectSelector
      workspaces={appData.workspaces}
      projects={appData.projects}
      onProjectSelect={handleProjectSelect}
    />
  );

  return (
    <Layout sidebar={sidebarContent}>
      <div className="w-full">
        <IssueList
          issues={appData.issues}
          projectId={selectedProjectId}
          onAddIssue={handleAddIssue}
        />
        {/* We will add the AddIssueDialog component here later */}
      </div>
    </Layout>
  );
};

export default Index;