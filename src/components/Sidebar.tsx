import React from 'react';
import { Workspace, Project } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2 } from 'lucide-react'; // Import Trash2 icon
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface SidebarProps {
  workspaces: Workspace[];
  projects: Project[];
  selectedWorkspaceId: string | null;
  selectedProjectId: string | null;
  onSelectWorkspace: (id: string) => void;
  onSelectProject: (id: string) => void;
  onAddWorkspace: () => void;
  onAddProject: () => void;
  onDeleteWorkspace: (id: string) => void; // Add delete handlers
  onDeleteProject: (id: string) => void;   // Add delete handlers
}

const Sidebar: React.FC<SidebarProps> = ({
  workspaces,
  projects,
  selectedWorkspaceId,
  selectedProjectId,
  onSelectWorkspace,
  onSelectProject,
  onAddWorkspace,
  onAddProject,
  onDeleteWorkspace, // Destructure delete handlers
  onDeleteProject,   // Destructure delete handlers
}) => {

  const filteredProjects = projects.filter(p => p.workspaceId === selectedWorkspaceId);

  const handleDeleteWorkspaceClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent select trigger
    onDeleteWorkspace(id);
  };

  const handleDeleteProjectClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent select trigger
    onDeleteProject(id);
  };


  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col w-full space-y-4">
        {/* Workspace Selection */}
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-2 pt-0">
            <CardTitle className="text-sm font-medium">Workspace</CardTitle>
            <div className="flex items-center space-x-1">
               {selectedWorkspaceId && (
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteWorkspaceClick(e, selectedWorkspaceId)}
                            className="p-1 h-auto text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete Workspace</p>
                    </TooltipContent>
                 </Tooltip>
               )}
               <Tooltip>
                 <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={onAddWorkspace} className="p-1 h-auto text-muted-foreground hover:text-foreground">
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                 </TooltipTrigger>
                 <TooltipContent>
                    <p>Add Workspace</p>
                 </TooltipContent>
               </Tooltip>
            </div>
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
               <div className="flex items-center space-x-1">
                 {selectedProjectId && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDeleteProjectClick(e, selectedProjectId)}
                                className="p-1 h-auto text-muted-foreground hover:text-destructive"
                                disabled={!selectedWorkspaceId}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete Project</p>
                        </TooltipContent>
                    </Tooltip>
                 )}
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={onAddProject} className="p-1 h-auto text-muted-foreground hover:text-foreground" disabled={!selectedWorkspaceId}>
                            <PlusCircle className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Add Project</p>
                    </TooltipContent>
                 </Tooltip>
               </div>
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
    </TooltipProvider>
  );
};

export default Sidebar;