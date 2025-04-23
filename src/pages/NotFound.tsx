import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header'; // Optional: include header for consistency

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-muted/40">
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
            <p className="text-muted-foreground mb-6">
                Sorry, the page you are looking for does not exist or has been moved.
            </p>
            <Button asChild>
                <Link to="/">Go Back Home</Link>
            </Button>
        </div>
    </div>
  );
};

export default NotFound;