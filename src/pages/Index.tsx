// ... existing imports ...

interface IndexProps {
  workspaces: Workspace[];
  projects: Project[];
  issues: Issue[]; // Already exists
  // ... other props ...
}

const Index: React.FC<IndexProps> = ({
  workspaces,
  projects,
  issues, // Already in props
  // ... other props ...
}) => {
  // ... existing code ...

  const sidebarContent = (
    <Sidebar
      workspaces={workspaces}
      projects={projects}
      issues={issues} // Add this line
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

  // ... rest of the component ...
};