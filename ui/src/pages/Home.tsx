import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center space-y-6 max-w-3xl">
        <h1 className="text-4xl font-bold text-primary sm:text-5xl">GitAlerts</h1>
        <p className="text-xl text-muted-foreground">
          Automated security scanning for GitHub repositories
        </p>
        <p className="text-lg text-foreground">
          Detect exposed secrets and sensitive information in your code using TruffleHog
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-8 sm:gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/scans"
                className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
              >
                View Scans
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
