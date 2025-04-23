import React from 'react';
import { Workspace, Project } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils"; // Import cn utility

interface SidebarProps {
  workspaces: Workspace[];
  projects: Project[];
  selectedWorkspaceId: string | null;
  selectedProjectId: string | null;
  onSelectWorkspace: (id: string) => void;
  onSelectProject: (id: string) => void;
  onAddWorkspace: () => void;
  onAddProject: () => void;
  onDeleteWorkspace: (id: string) => void;
  onDeleteProject: (id: string) => void;
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
  onDeleteWorkspace,
  onDeleteProject,
}) => {

  const filteredProjects = projects.filter(p => p.workspaceId === selectedWorkspaceId);

  const handleDeleteWorkspaceClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteWorkspace(id);
  };

  const handleDeleteProjectClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteProject(id);
  };

  // Common classes for buttons on dark background
  const iconButtonClasses = "p-1 h-auto text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10";
  const deleteButtonClasses = "p-1 h-auto text-primary-foreground/70 hover:text-red-400 hover:bg-white/10";

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col w-full space-y-6"> {/* Increased spacing */}
        {/* Workspace Selection */}
        <div className="space-y-2"> {/* Group header and select */}
          <div className="flex flex-row items-center justify-between px-2">
            {/* Adjusted title color */}
            <CardTitle className="text-sm font-medium text-primary-foreground/90">Workspace</CardTitle>
            <div className="flex items-center space-x-1">
               {selectedWorkspaceId && (
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteWorkspaceClick(e, selectedWorkspaceId)}
                            className={cn(deleteButtonClasses)} // Use common classes
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
                    <Button variant="ghost" size="sm" onClick={onAddWorkspace} className={cn(iconButtonClasses)}>
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                 </TooltipTrigger>
                 <TooltipContent>
                    <p>Add Workspace</p>
                 </TooltipContent>
               </Tooltip>
            </div>
          </div>
          <div className="px-2"> {/* Add padding for select */}
            {/* Adjusted Select styling for dark background */}
            <Select onValueChange={onSelectWorkspace} value={selectedWorkspaceId ?? undefined}>
              <SelectTrigger className="bg-white/5 border-white/20 text-primary-foreground hover:bg-white/10 focus:ring-offset-0 focus:ring-primary-foreground/50">
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
        </div>


        {/* Project Selection */}
        {selectedWorkspaceId && (
          <div className="space-y-2"> {/* Group header and select */}
            <div className="flex flex-row items-center justify-between px-2">
              {/* Adjusted title color */}
              <CardTitle className="text-sm font-medium text-primary-foreground/90">Project</CardTitle>
               <div className="flex items-center space-x-1">
                 {selectedProjectId && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDeleteProjectClick(e, selectedProjectId)}
                                className={cn(deleteButtonClasses)} // Use common classes
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
                        <Button variant="ghost" size="sm" onClick={onAddProject} className={cn(iconButtonClasses)} disabled={!selectedWorkspaceId}>
                            <PlusCircle className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Add Project</p>
                    </TooltipContent>
                 </Tooltip>
               </div>
            </div>
            <div className="px-2"> {/* Add padding for select */}
              {/* Adjusted Select styling for dark background */}
              <Select onValueChange={onSelectProject} value={selectedProjectId ?? undefined} disabled={!selectedWorkspaceId}>
                <SelectTrigger className="bg-white/5 border-white/20 text-primary-foreground hover:bg-white/10 focus:ring-offset-0 focus:ring-primary-foreground/50">
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
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;