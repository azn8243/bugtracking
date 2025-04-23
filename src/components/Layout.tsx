import React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import Header from './Header'; // Import the new Header

interface LayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ sidebar, children }) => {
  return (
    <div className="flex flex-col h-screen bg-muted/40">
      <Header />
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 w-full" // Removed border, added flex-1
      >
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-background">
          {/* Adjusted padding for sidebar panel */}
          <div className="flex h-full items-start justify-center p-4 pt-6">
            {sidebar}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
           {/* Adjusted padding for main content panel */}
          <div className="flex h-full flex-col items-start justify-start p-6">
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Layout;