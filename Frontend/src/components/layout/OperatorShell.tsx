import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, User, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/cn';
import { BrandMark } from './BrandMark';
import { operatorNavItems } from './nav';
import { SceneBackdrop } from '../motion/SceneBackdrop';

interface OperatorShellProps {
  children: React.ReactNode;
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {operatorNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 type-label transition-[color,background-color,transform] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)]',
                isActive
                  ? 'bg-primary-muted text-primary'
                  : 'text-muted hover:bg-surface-muted hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function OperatorShell({ children }: OperatorShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="relative min-h-screen bg-background">
      <SceneBackdrop />
      <div className="relative z-10 lg:flex">
        <aside className="hidden w-sidebar shrink-0 border-r border-white/[0.06] bg-surface/80 lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:backdrop-blur-xl">
          <div className="border-b border-border px-5 py-4">
            <BrandMark />
            <p className="type-meta mt-3">Operator console</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarNav />
          </div>
          <div className="border-t border-border p-4">
            <div className="mb-3 flex items-center gap-3 rounded-md bg-surface-muted px-3 py-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
                <User className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="type-label truncate">
                  {user?.companyName || user?.userName}
                </div>
                <div className="type-meta truncate">Field operator</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-sidebar">
          <header className="sticky top-0 z-30 flex h-shell items-center justify-between gap-3 border-b border-white/[0.06] bg-background/75 px-4 backdrop-blur-xl sm:px-6 lg:hidden">
            <BrandMark compact />
            <div className="flex items-center gap-2">
              <button
              type="button"
              className="rounded-md p-2 text-muted hover:bg-surface-muted hover:text-foreground"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col bg-surface shadow-modal">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <BrandMark compact />
              <button
                type="button"
                className="rounded-md p-2 text-muted hover:bg-surface-muted"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-border p-4">
              <Link
                to="/admin/settings?tab=profile"
                onClick={() => setMobileOpen(false)}
                className="mb-2 block rounded-md px-3 py-2 text-sm text-foreground hover:bg-surface-muted"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
