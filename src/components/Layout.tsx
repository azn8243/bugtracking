import React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import Header from './Header';

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
        className="flex-1 w-full"
      >
        {/* Added dark background and light text color to the sidebar panel */}
        <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={30}
            className="!overflow-y-auto bg-gradient-to-b from-primary to-purple-700 text-primary-foreground p-0" // Apply background and text color here, remove padding
        >
          {/* Removed flex container, added padding directly here */}
          <div className="p-4 pt-6 h-full">
             {sidebar}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-border" /> {/* Added subtle color to handle */}
        <ResizablePanel defaultSize={80}>
          <div className="flex h-full flex-col items-start justify-start p-6 overflow-auto"> {/* Added overflow-auto */}
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Layout;