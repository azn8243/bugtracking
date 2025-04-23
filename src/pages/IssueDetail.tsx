import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Issue, Workspace, Project, Attachment, IssueType, IssueStatus } from '@/types';
import Header from '@/components/Header'; // Re-use header
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Trash2, Upload, FileText, X, Save, Edit2, Check } from 'lucide-react';
import ConfirmationDialog from '@/components/ConfirmationDialog'; // Re-use confirmation dialog

// Define options arrays (could also be passed as props)
const issueTypes: IssueType[] = ['Bug', 'Task', 'Story', 'Epic'];
const issueStatuses: IssueStatus[] = ['ToDo', 'InProgress', 'Done', 'Blocked'];

interface IssueDetailProps {
  getIssueById: (id: string | null) => Issue | null;
  getWorkspaceById: (id: string | null) => Workspace | null;
  getProjectById: (id: string | null) => Project | null;
  onUpdateIssue: (id: string, updates: Partial<Pick<Issue, 'title' | 'description' | 'type' | 'status'>>) => void;
  onAddAttachment: (issueId: string, file: File) => void;
  onDeleteAttachment: (issueId: string, attachmentId: string, attachmentName: string) => void;
}

const IssueDetail: React.FC<IssueDetailProps> = ({
  getIssueById,
  getWorkspaceById,
  getProjectById,
  onUpdateIssue,
  onAddAttachment,
  onDeleteAttachment,
}) => {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [issue, setIssue] = useState<Issue | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  // Editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editableDescription, setEditableDescription] = useState('');

  // Confirmation dialog state for attachments
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null);

  useEffect(() => {
    if (issueId) {
      const fetchedIssue = getIssueById(issueId);
      setIssue(fetchedIssue);
      if (fetchedIssue) {
        setWorkspace(getWorkspaceById(fetchedIssue.workspaceId));
        setProject(getProjectById(fetchedIssue.projectId));
        setEditableTitle(fetchedIssue.title);
        setEditableDescription(fetchedIssue.description ?? '');
      } else {
        // Handle issue not found (e.g., navigate to a 404 page or back)
        console.warn(`Issue with ID ${issueId} not found.`);
        // Optionally navigate away: navigate('/not-found');
      }
    }
  }, [issueId, getIssueById, getWorkspaceById, getProjectById, navigate]);

  // --- Edit Handlers ---
  const handleSaveTitle = () => {
    if (issue && editableTitle.trim() && editableTitle !== issue.title) {
      onUpdateIssue(issue.id, { title: editableTitle.trim() });
      toast.success("Title updated.");
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitleEdit = () => {
    if (issue) setEditableTitle(issue.title);
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
     if (issue && editableDescription !== (issue.description ?? '')) {
       onUpdateIssue(issue.id, { description: editableDescription });
       toast.success("Description updated.");
     }
     setIsEditingDescription(false);
  };

   const handleCancelDescriptionEdit = () => {
    if (issue) setEditableDescription(issue.description ?? '');
    setIsEditingDescription(false);
  };

  // --- Type/Status Change Handlers ---
  const handleTypeChange = (newType: string) => {
    if (issue && newType !== issue.type) {
      onUpdateIssue(issue.id, { type: newType as IssueType });
      toast.success("Type updated.");
    }
  };

  const handleStatusChange = (newStatus: string) => {
     if (issue && newStatus !== issue.status) {
       onUpdateIssue(issue.id, { status: newStatus as IssueStatus });
       toast.success("Status updated.");
     }
  };

  // --- Attachment Handlers ---
   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0 && issue) {
      const file = event.target.files[0];
      onAddAttachment(issue.id, file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const requestDeleteAttachment = (attachment: Attachment) => {
    setAttachmentToDelete(attachment);
  };

  const confirmDeleteAttachment = () => {
    if (attachmentToDelete && issue) {
      onDeleteAttachment(issue.id, attachmentToDelete.id, attachmentToDelete.name);
    }
    setAttachmentToDelete(null); // Close dialog
  };

  // --- Render Logic ---
  if (!issue) {
    // Optional: Render a loading state or a "Not Found" message
    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-1 items-center justify-center">
                <p>Loading issue details or issue not found...</p>
                 <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Issues
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-muted/40">
      <Header />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Breadcrumbs & Back Button */}
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground">Workspaces</Link>
                {workspace && <ChevronRight className="h-4 w-4" />}
                {workspace && <span className="hover:text-foreground">{workspace.name}</span>}
                {project && <ChevronRight className="h-4 w-4" />}
                {project && <span className="hover:text-foreground">{project.name}</span>}
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-foreground">{issue.title}</span>
           </div>
           <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back to List
           </Button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column: Details & Description */}
          <div className="col-span-2 space-y-6">
            {/* Title */}
            <Card>
              <CardHeader>
                 {!isEditingTitle ? (
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">{issue.title}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsEditingTitle(true)}>
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    </div>
                 ) : (
                    <div className="flex items-center space-x-2">
                        <Input
                            value={editableTitle}
                            onChange={(e) => setEditableTitle(e.target.value)}
                            className="text-2xl font-semibold h-auto p-0 border-0 shadow-none focus-visible:ring-0"
                            autoFocus
                        />
                        <Button variant="ghost" size="icon" onClick={handleSaveTitle}>
                            <Check className="h-4 w-4 text-green-600" />
                        </Button>
                         <Button variant="ghost" size="icon" onClick={handleCancelTitleEdit}>
                            <X className="h-4 w-4 text-red-600" />
                        </Button>
                    </div>
                 )}
              </CardHeader>
              <CardContent>
                 <CardDescription>Created on: {new Date(issue.createdAt).toLocaleDateString()}</CardDescription>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                 <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Description</CardTitle>
                     {!isEditingDescription ? (
                        <Button variant="ghost" size="icon" onClick={() => setIsEditingDescription(true)}>
                            <Edit2 className="h-4 w-4" />
                        </Button>
                     ) : (
                         <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="icon" onClick={handleSaveDescription}>
                                <Check className="h-4 w-4 text-green-600" />
                            </Button>
                             <Button variant="ghost" size="icon" onClick={handleCancelDescriptionEdit}>
                                <X className="h-4 w-4 text-red-600" />
                            </Button>
                        </div>
                     )}
                 </div>
              </CardHeader>
              <CardContent>
                 {!isEditingDescription ? (
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                        {issue.description || <p>No description provided.</p>}
                    </div>
                 ) : (
                    <Textarea
                        value={editableDescription}
                        onChange={(e) => setEditableDescription(e.target.value)}
                        rows={6}
                        className="text-sm"
                        autoFocus
                    />
                 )}
              </CardContent>
            </Card>

             {/* Attachments */}
            <Card>
              <CardHeader>
                 <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Attachments</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" /> Add Attachment
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                 </div>
              </CardHeader>
              <CardContent>
                 {(!issue.attachments || issue.attachments.length === 0) ? (
                    <p className="text-sm text-muted-foreground">No attachments yet.</p>
                 ) : (
                    <ul className="space-y-2">
                        {issue.attachments.map(att => (
                            <li key={att.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    {/* In a real app, this would be a link to download */}
                                    <span className="text-sm font-medium">{att.name}</span>
                                    <span className="text-xs text-muted-foreground">({(att.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => requestDeleteAttachment(att)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                 )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Metadata */}
          <div className="col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="issue-type">Type</Label>
                        <Select value={issue.type} onValueChange={handleTypeChange}>
                            <SelectTrigger id="issue-type">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {issueTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="issue-status">Status</Label>
                        <Select value={issue.status} onValueChange={handleStatusChange}>
                            <SelectTrigger id="issue-status">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {issueStatuses.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <Separator />
                     <div className="text-sm space-y-1">
                        <p className="text-muted-foreground">Workspace:</p>
                        <p>{workspace?.name ?? 'N/A'}</p>
                     </div>
                      <div className="text-sm space-y-1">
                        <p className="text-muted-foreground">Project:</p>
                        <p>{project?.name ?? 'N/A'}</p>
                     </div>
                      <div className="text-sm space-y-1">
                        <p className="text-muted-foreground">Issue ID:</p>
                        <p className="font-mono text-xs">{issue.id}</p>
                     </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>

       {/* Attachment Deletion Confirmation */}
        <ConfirmationDialog
            isOpen={!!attachmentToDelete}
            onOpenChange={(open) => !open && setAttachmentToDelete(null)}
            onConfirm={confirmDeleteAttachment}
            title="Delete Attachment?"
            description={`Are you sure you want to delete the attachment "${attachmentToDelete?.name ?? ''}"? This action cannot be undone.`}
        />
    </div>
  );
};

export default IssueDetail;