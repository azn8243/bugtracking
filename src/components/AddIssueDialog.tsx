import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Issue, IssueStatus, IssueType } from '@/types';
import { toast } from "sonner"; // Using sonner for toasts

interface AddIssueDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddIssue: (newIssueData: Omit<Issue, 'id' | 'createdAt' | 'projectId' | 'workspaceId'>) => void;
  projectId: string | null;
  workspaceId: string | null;
}

const issueTypes: IssueType[] = ['Bug', 'Task', 'Story', 'Epic'];
const issueStatuses: IssueStatus[] = ['ToDo', 'InProgress', 'Done', 'Blocked'];

const AddIssueDialog: React.FC<AddIssueDialogProps> = ({ isOpen, onOpenChange, onAddIssue, projectId, workspaceId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IssueType>('Bug');
  const [status, setStatus] = useState<IssueStatus>('ToDo');
  // Add state for file uploads later
  // const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || !workspaceId) {
        toast.error("Please select a workspace and project first.");
        return;
    }
    if (!title.trim()) {
        toast.error("Issue title cannot be empty.");
        return;
    }

    onAddIssue({
      title,
      description,
      type,
      status,
    });

    // Reset form and close dialog
    setTitle('');
    setDescription('');
    setType('Bug');
    setStatus('ToDo');
    onOpenChange(false);
    toast.success("Issue added successfully!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Trigger is handled externally */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Issue</DialogTitle>
          <DialogDescription>
            Fill in the details for the new issue. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                rows={4}
              />
            </div>

             {/* Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
               <Select onValueChange={(value) => setType(value as IssueType)} value={type}>
                 <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Type" />
                 </SelectTrigger>
                 <SelectContent>
                    {issueTypes.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                 </SelectContent>
               </Select>
            </div>

             {/* Status */}
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
               <Select onValueChange={(value) => setStatus(value as IssueStatus)} value={status}>
                 <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Status" />
                 </SelectTrigger>
                 <SelectContent>
                    {issueStatuses.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                 </SelectContent>
               </Select>
            </div>

            {/* File Upload Placeholder */}
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="files" className="text-right">
                Attachments
              </Label>
              <Input id="files" type="file" multiple className="col-span-3" />
            </div> */}

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Issue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddIssueDialog;