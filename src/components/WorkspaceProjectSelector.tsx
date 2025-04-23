import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workspace, Project } from '@/types'; // Assuming types are defined

interface WorkspaceProjectSelectorProps {
  workspaces: Workspace[];
  projects: Project[];
  onProjectSelect: (projectId: string | null) => void;
}

const WorkspaceProjectSelector: React.FC<WorkspaceProjectSelectorProps> = ({
  workspaces,
  projects,
  onProjectSelect,
}) => {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleWorkspaceChange = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setSelectedProjectId(null); // Reset project when workspace changes
    onProjectSelect(null);
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    onProjectSelect(projectId);
  };

  const filteredProjects = selectedWorkspaceId
    ? projects.filter(p => p.workspaceId === selectedWorkspaceId)
    : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Navigation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Workspace</label>
          <Select onValueChange={handleWorkspaceChange} value={selectedWorkspaceId ?? undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Select Workspace" />
            </SelectTrigger>
            <SelectContent>
              {workspaces.map((ws) => (
                <SelectItem key={ws.id} value={ws.id}>
                  {ws.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedWorkspaceId && (
          <div>
            <label className="text-sm font-medium mb-1 block">Project</label>
            <Select onValueChange={handleProjectChange} value={selectedProjectId ?? undefined} disabled={!selectedWorkspaceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((proj) => (
                    <SelectItem key={proj.id} value={proj.id}>
                      {proj.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-projects" disabled>No projects in this workspace</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkspaceProjectSelector;