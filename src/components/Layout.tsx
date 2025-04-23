import React from 'react'; // Add explicit React import
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

interface LayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ sidebar, children }) => {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-screen w-full rounded-lg border"
    >
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <div className="flex h-full items-center justify-center p-6">
          {sidebar}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80}>
        <div className="flex h-full items-start justify-start p-6">
          {children}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Layout;