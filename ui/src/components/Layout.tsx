import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/scans', label: 'Scans' },
  { to: '/findings', label: 'Findings' },
  { to: '/integrations', label: 'Integrations' },
  { to: '/settings', label: 'Settings' },
];

const linkClass =
  'flex min-h-11 items-center rounded-md px-2 text-base font-medium text-foreground hover:bg-muted hover:text-primary md:min-h-0 md:px-0 md:text-sm md:hover:bg-transparent transition-colors';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // The panel remembers the history entry it was opened on, so any navigation (link,
  // back/forward, redirect) closes it without an effect: a new entry has a new key.
  const [menuKey, setMenuKey] = useState<string | null>(null);
  const menuOpen = menuKey === location.key;
  const closeMenu = () => setMenuKey(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuKey(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 py-2">
            <Link to="/" className="truncate text-xl font-bold text-primary sm:text-2xl">
              GitAlerts
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
              {NAV_ITEMS.map((item) => (
                <Link key={item.to} to={item.to} className={linkClass}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <ThemeToggle />
              {user && (
                <span className="hidden truncate text-sm text-muted-foreground lg:inline">
                  {user.username}
                </span>
              )}
              {user && (
                <button
                  onClick={handleLogout}
                  className="hidden text-sm font-medium text-foreground hover:text-primary transition-colors md:inline-flex md:min-h-11 md:items-center"
                >
                  Logout
                </button>
              )}
              <button
                type="button"
                onClick={() => (menuOpen ? closeMenu() : setMenuKey(location.key))}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted transition-colors md:hidden"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile navigation panel */}
          {menuOpen && (
            <nav id="mobile-nav" className="border-t border-border pb-2 pt-1 md:hidden" aria-label="Mobile">
              <ul className="flex flex-col">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} onClick={closeMenu} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {user && (
                <div className="mt-2 flex items-center justify-between gap-3 border-t border-border px-2 pt-3">
                  <span className="truncate text-sm text-muted-foreground">{user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex min-h-11 items-center rounded-md px-2 text-base font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};
