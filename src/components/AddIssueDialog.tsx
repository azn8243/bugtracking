import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Issue, IssueStatus, IssueType, Attachment } from '@/types'; // Import Attachment
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid'; // Import uuid for attachment IDs

interface AddIssueDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // Update prop type to include attachments
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
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null); // State for selected files

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

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

    // Prepare attachments array
    const attachments: Attachment[] = [];
    if (selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            // Basic size check (e.g., 10MB limit) - adjust as needed
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File "${file.name}" is too large (max 10MB).`);
                continue; // Skip this file
            }
            attachments.push({
                id: uuidv4(),
                name: file.name,
                size: file.size,
                type: file.type,
                file: file, // Store the File object
            });
        }
    }

    onAddIssue({
      title,
      description,
      type,
      status,
      attachments: attachments.length > 0 ? attachments : undefined, // Add attachments if any were valid
    });

    // Reset form and close dialog
    setTitle('');
    setDescription('');
    setType('Bug');
    setStatus('ToDo');
    setSelectedFiles(null); // Reset file input state
    // Clear the file input visually (find the input and reset its value)
    const fileInput = document.getElementById('attachments') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }

    onOpenChange(false);
    toast.success("Issue added successfully!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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

            {/* File Upload */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attachments" className="text-right">
                Attachments
              </Label>
              <Input
                id="attachments" // Ensure ID matches the reset logic in handleSubmit
                type="file"
                multiple
                className="col-span-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                onChange={handleFileChange} // Add onChange handler
              />
            </div>
             {/* Display selected file names (optional) */}
             {selectedFiles && selectedFiles.length > 0 && (
                <div className="col-span-4 grid grid-cols-4 items-start gap-4">
                    <div className="col-start-2 col-span-3 text-xs text-muted-foreground space-y-1 max-h-20 overflow-y-auto"> {/* Limit height and add scroll */}
                        <p className="font-medium">Selected files:</p>
                        {Array.from(selectedFiles).map((file, index) => (
                            <p key={index} className="truncate">{file.name} ({ (file.size / 1024).toFixed(1) } KB)</p>
                        ))}
                    </div>
                </div>
             )}

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