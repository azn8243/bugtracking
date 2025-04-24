import React from 'react';
import { Workspace, Project, Issue } from '@/types';
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
import { cn } from "@/lib/utils";
import ReportsCard from './ReportsCard'; // Add this import

interface SidebarProps {
  workspaces: Workspace[];
  projects: Project[];
  issues: Issue[]; // Add issues prop
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
  issues, // Add issues to props
  selectedWorkspaceId,
  selectedProjectId,
  onSelectWorkspace,
  onSelectProject,
  onAddWorkspace,
  onAddProject,
  onDeleteWorkspace,
  onDeleteProject,
}) => {
  // ... existing code ...

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col w-full space-y-6">
        {/* Workspace Selection */}
        {/* ... existing workspace selection code ... */}

        {/* Project Selection */}
        {/* ... existing project selection code ... */}

        {/* Add Reports Card below project selection */}
        <ReportsCard issues={issues} />
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;