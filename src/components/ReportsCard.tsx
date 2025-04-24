import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Issue } from '@/types';
import * as XLSX from 'xlsx';

interface ReportsCardProps {
  issues: Issue[];
}

const ReportsCard: React.FC<ReportsCardProps> = ({ issues }) => {
  const generateReport = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filteredIssues = issues.filter(issue => 
      new Date(issue.createdAt) >= cutoffDate
    );

    if (filteredIssues.length === 0) {
      toast.info(`No issues created in the last ${days} days`);
      return;
    }

    const reportData = filteredIssues.map(issue => ({
      ID: issue.id,
      Title: issue.title,
      Type: issue.type,
      Status: issue.status,
      Priority: issue.priority,
      Created: issue.createdAt.toLocaleDateString(),
      Project: issue.projectId
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Issues");
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `issues_last_${days}_days_${dateStr}.xlsx`);
    toast.success(`Report for last ${days} days downloaded`);
  };

  return (
    <Card className="bg-white/5 border-white/20">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-primary-foreground/90">
          Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full text-primary-foreground bg-white/5 hover:bg-white/10"
          onClick={() => generateReport(7)}
        >
          <Download className="mr-2 h-4 w-4" />
          Last 7 Days
        </Button>
        <Button 
          variant="outline" 
          className="w-full text-primary-foreground bg-white/5 hover:bg-white/10"
          onClick={() => generateReport(30)}
        >
          <Download className="mr-2 h-4 w-4" />
          Last 30 Days
        </Button>
        <Button 
          variant="outline" 
          className="w-full text-primary-foreground bg-white/5 hover:bg-white/10"
          onClick={() => generateReport(60)}
        >
          <Download className="mr-2 h-4 w-4" />
          Last 60 Days
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReportsCard;