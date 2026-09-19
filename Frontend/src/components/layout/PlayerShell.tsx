import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, User, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/cn';
import { BrandMark } from './BrandMark';
import { Button } from '../ui/Button';
import { playerNavItems } from './nav';
import { SceneBackdrop } from '../motion/SceneBackdrop';

interface PlayerShellProps {
  children: React.ReactNode;
}

function NavLinkItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
                'rounded-md px-3 py-2 type-label transition-[color,background-color,transform] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)]',
          isActive
            ? 'bg-primary-muted text-primary'
            : 'text-muted hover:bg-surface-muted hover:text-foreground'
        )
      }
    >
      {children}
    </NavLink>
  );
}

export function PlayerShell({ children }: PlayerShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="relative min-h-screen bg-background">
      <SceneBackdrop />
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.06] bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-shell max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandMark />

          <nav className="hidden items-center gap-1 md:flex">
            <NavLinkItem to="/turfs">Browse Fields</NavLinkItem>
            {user && (
              <>
                <NavLinkItem to="/dashboard">Dashboard</NavLinkItem>
                <NavLinkItem to="/bookings">My Bookings</NavLinkItem>
              </>
            )}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-foreground hover:bg-surface"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.fullName || user.userName}
                        className="h-full w-full rounded-md object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </span>
                  <span className="type-label max-w-[8rem] truncate">{user.userName}</span>
                  <ChevronDown className="h-4 w-4 text-muted" />
                </button>
                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-surface p-1 shadow-dropdown"
                  >
                    <Link
                      to="/preferences?tab=profile"
                      className="block rounded-md px-3 py-2 type-label hover:bg-surface-muted"
                      onClick={() => setProfileOpen(false)}
                    >
                      Profile settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              className="rounded-md p-2 text-muted hover:bg-surface-muted hover:text-foreground"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {playerNavItems
                .filter((item) => user || item.to === '/turfs')
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'rounded-md px-3 py-2 type-label',
                        isActive
                          ? 'bg-primary-muted text-primary'
                          : 'text-muted hover:bg-surface-muted hover:text-foreground'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              {user ? (
                <>
                  <Link
                    to="/preferences?tab=profile"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 type-label hover:bg-surface-muted"
                  >
                    Profile settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="rounded-md px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 pt-shell">{children}</main>
    </div>
  );
}
