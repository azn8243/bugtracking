import React from 'react';
import { Workspace, Project } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from 'lucide-react';

interface SidebarProps {
  workspaces: Workspace[];
  projects: Project[];
  selectedWorkspaceId: string | null;
  selectedProjectId: string | null;
  onSelectWorkspace: (id: string) => void;
  onSelectProject: (id: string) => void;
  onAddWorkspace: () => void;
  onAddProject: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  workspaces,
  projects,
  selectedWorkspaceId,
  selectedProjectId,
  onSelectWorkspace,
  onSelectProject,
  onAddWorkspace,
  onAddProject
}) => {

  const filteredProjects = projects.filter(p => p.workspaceId === selectedWorkspaceId);

  return (
    // Removed h-full, let the panel handle height
    <div className="flex flex-col w-full space-y-4">
      {/* Workspace Selection - Removed Card border/shadow if desired, using panel background */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-2 pt-0">
           <CardTitle className="text-sm font-medium">Workspace</CardTitle>
           <Button variant="ghost" size="sm" onClick={onAddWorkspace} className="p-1 h-auto text-muted-foreground hover:text-foreground">
             <PlusCircle className="h-4 w-4" />
           </Button>
        </CardHeader>
        <CardContent className="p-2">
           <Select onValueChange={onSelectWorkspace} value={selectedWorkspaceId ?? undefined}>
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
        </CardContent>
      </Card>


      {/* Project Selection */}
      {selectedWorkspaceId && (
         <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-2 pt-0">
            <CardTitle className="text-sm font-medium">Project</CardTitle>
             <Button variant="ghost" size="sm" onClick={onAddProject} className="p-1 h-auto text-muted-foreground hover:text-foreground" disabled={!selectedWorkspaceId}>
                <PlusCircle className="h-4 w-4" />
             </Button>
          </CardHeader>
          <CardContent className="p-2">
            <Select onValueChange={onSelectProject} value={selectedProjectId ?? undefined} disabled={!selectedWorkspaceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {filteredProjects.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id}>
                    {proj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Sidebar;