import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Issue, Workspace, Project, Attachment, IssueType, IssueStatus } from '@/types';
import Header from '@/components/Header'; // Re-use header
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Paperclip, Trash2, UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns'; // For date formatting

// Define options arrays (could be imported from a shared constants file)
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

    // Local state for editing fields
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editableTitle, setEditableTitle] = useState('');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editableDescription, setEditableDescription] = useState('');

    useEffect(() => {
        if (issueId) {
            const fetchedIssue = getIssueById(issueId);
            setIssue(fetchedIssue);
            if (fetchedIssue) {
                setProject(getProjectById(fetchedIssue.projectId));
                setWorkspace(getWorkspaceById(fetchedIssue.workspaceId));
                setEditableTitle(fetchedIssue.title);
                setEditableDescription(fetchedIssue.description ?? '');
            } else {
                // Handle issue not found (e.g., redirect or show message)
                // For now, just clear project/workspace
                setProject(null);
                setWorkspace(null);
            }
        }
    }, [issueId, getIssueById, getProjectById, getWorkspaceById]);

    const handleTitleSave = () => {
        if (issue && editableTitle.trim() !== issue.title) {
            onUpdateIssue(issue.id, { title: editableTitle.trim() });
            // Optimistically update local state, App state update will confirm
            setIssue(prev => prev ? { ...prev, title: editableTitle.trim() } : null);
        }
        setIsEditingTitle(false);
    };

    const handleDescriptionSave = () => {
        if (issue && editableDescription !== (issue.description ?? '')) {
             onUpdateIssue(issue.id, { description: editableDescription });
             setIssue(prev => prev ? { ...prev, description: editableDescription } : null);
        }
        setIsEditingDescription(false);
    };

    const handleTypeChange = (newType: string) => {
        if (issue) {
            onUpdateIssue(issue.id, { type: newType as IssueType });
            setIssue(prev => prev ? { ...prev, type: newType as IssueType } : null);
        }
    };

    const handleStatusChange = (newStatus: string) => {
        if (issue) {
            onUpdateIssue(issue.id, { status: newStatus as IssueStatus });
             setIssue(prev => prev ? { ...prev, status: newStatus as IssueStatus } : null);
        }
    };

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

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-muted-foreground" />;
        // Add more specific icons later (pdf, doc, etc.)
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    };

    if (!issue) {
        // Optional: Add a more sophisticated loading state
        return (
            <div className="flex flex-col h-screen">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <p>Issue not found or loading...</p>
                    <Button variant="outline" onClick={() => navigate('/')} className="ml-4">Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-muted/5">
            <Header />
            <div className="flex-1 overflow-y-auto p-6">
                {/* Breadcrumbs & Back Button */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Link to="/" className="hover:underline">Home</Link>
                        {workspace && <><ChevronRight className="h-4 w-4" /><span>{workspace.name}</span></>}
                        {project && <><ChevronRight className="h-4 w-4" /><span>{project.name}</span></>}
                        <ChevronRight className="h-4 w-4" />
                        <span className="font-medium text-foreground">{issue.id.substring(0, 8)}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                        <ChevronLeft className="mr-1 h-4 w-4" /> Back to List
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content Area */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Title Card */}
                        <Card>
                            <CardHeader>
                                {isEditingTitle ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={editableTitle}
                                            onChange={(e) => setEditableTitle(e.target.value)}
                                            className="text-2xl font-semibold flex-1"
                                            autoFocus
                                            onBlur={handleTitleSave} // Save on blur
                                            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                                        />
                                        <Button size="sm" onClick={handleTitleSave}>Save</Button>
                                        <Button size="sm" variant="outline" onClick={() => { setIsEditingTitle(false); setEditableTitle(issue.title); }}>Cancel</Button>
                                    </div>
                                ) : (
                                    <CardTitle className="text-2xl font-semibold cursor-pointer hover:bg-muted/50 p-1 rounded" onClick={() => setIsEditingTitle(true)}>
                                        {issue.title}
                                    </CardTitle>
                                )}
                                <CardDescription>
                                    Created on {format(issue.createdAt, 'PPP')}
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        {/* Description Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isEditingDescription ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={editableDescription}
                                            onChange={(e) => setEditableDescription(e.target.value)}
                                            rows={6}
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" onClick={handleDescriptionSave}>Save</Button>
                                            <Button size="sm" variant="outline" onClick={() => { setIsEditingDescription(false); setEditableDescription(issue.description ?? ''); }}>Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="prose prose-sm max-w-none cursor-pointer min-h-[50px] hover:bg-muted/50 p-2 rounded" onClick={() => setIsEditingDescription(true)}>
                                        {issue.description ? (
                                            <p>{issue.description}</p>
                                        ) : (
                                            <p className="text-muted-foreground italic">No description provided. Click to add.</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                         {/* Attachments Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2"><Paperclip className="h-5 w-5" /> Attachments</CardTitle>
                                <Button size="sm" variant="outline" onClick={triggerFileInput}>
                                    <UploadCloud className="mr-2 h-4 w-4" /> Upload File
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </CardHeader>
                            <CardContent>
                                {(!issue.attachments || issue.attachments.length === 0) ? (
                                    <p className="text-sm text-muted-foreground italic">No attachments yet.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {issue.attachments.map(att => (
                                            <li key={att.id} className="flex items-center justify-between text-sm border p-2 rounded hover:bg-muted/50">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    {getFileIcon(att.type)}
                                                    {/* In real app, this would be a link to download */}
                                                    <span className="truncate flex-1" title={att.name}>{att.name}</span>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">({(att.size / 1024).toFixed(1)} KB)</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                                    onClick={() => onDeleteAttachment(issue.id, att.id, att.name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Area */}
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col space-y-1.5">
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
                                <div className="flex flex-col space-y-1.5">
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
                                    <p><span className="font-medium">Workspace:</span> {workspace?.name ?? 'N/A'}</p>
                                    <p><span className="font-medium">Project:</span> {project?.name ?? 'N/A'}</p>
                                    <p><span className="font-medium">Created:</span> {format(issue.createdAt, 'PPp')}</p>
                                    <p><span className="font-medium">Issue ID:</span> <span className="font-mono text-xs">{issue.id}</span></p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetail;