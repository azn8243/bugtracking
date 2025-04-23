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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface BulkAddIssuesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBulkIssues: (titles: string[]) => void; // Callback accepts array of titles
  projectId: string | null;
}

const BulkAddIssuesDialog: React.FC<BulkAddIssuesDialogProps> = ({ isOpen, onOpenChange, onAddBulkIssues, projectId }) => {
  const [titlesInput, setTitlesInput] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId) {
        toast.error("Please select a project first.");
        return;
    }
    // Split by newline, trim whitespace, filter out empty lines
    const titles = titlesInput
        .split('\n')
        .map(title => title.trim())
        .filter(title => title.length > 0);

    if (titles.length === 0) {
        toast.error("Please enter at least one issue title.");
        return;
    }

    onAddBulkIssues(titles);

    // Reset form and close dialog
    setTitlesInput('');
    onOpenChange(false);
    toast.success(`${titles.length} issue(s) added successfully!`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Bulk Issues</DialogTitle>
          <DialogDescription>
            Enter one issue title per line. Each line will create a new issue with default type ('Task') and status ('ToDo').
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="bulk-titles">Issue Titles</Label>
              <Textarea
                id="bulk-titles"
                placeholder="Login button broken&#10;Implement password reset&#10;Update documentation"
                value={titlesInput}
                onChange={(e) => setTitlesInput(e.target.value)}
                className="min-h-[150px]" // Make textarea larger
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add Issues</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddIssuesDialog;