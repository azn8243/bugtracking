import React from 'react';
import { Bug } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-background border-b px-6 py-3 flex items-center sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Bug className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold">Bug Tracker</h1>
      </div>
      {/* Add other header elements like user profile, settings later */}
    </header>
  );
};

export default Header;