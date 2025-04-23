import React from 'react';
import { Bug } from 'lucide-react';

const Header: React.FC = () => {
  return (
    // Added gradient, ensured text is white (primary-foreground)
    <header className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-primary-foreground border-b border-border/50 px-6 py-3 flex items-center sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-2">
        <Bug className="h-6 w-6" /> {/* Removed text-primary as foreground is now white */}
        <h1 className="text-xl font-semibold">Bug Tracker</h1>
      </div>
      {/* Add other header elements like user profile, settings later */}
    </header>
  );
};

export default Header;