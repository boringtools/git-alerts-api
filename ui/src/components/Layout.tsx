import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-primary">
                GitAlerts
              </Link>
              <nav className="flex space-x-6">
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/scans"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Scans
                </Link>
                <Link
                  to="/findings"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Findings
                </Link>
                <Link
                  to="/integrations"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Integrations
                </Link>
                <Link
                  to="/settings"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Settings
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <span className="text-sm text-muted-foreground">{user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
