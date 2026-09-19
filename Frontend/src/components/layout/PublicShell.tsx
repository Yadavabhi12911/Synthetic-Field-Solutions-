import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrandMark } from './BrandMark';
import { Button } from '../ui/Button';
import { cn } from '../../lib/cn';
import { SceneBackdrop } from '../motion/SceneBackdrop';

interface PublicShellProps {
  children: React.ReactNode;
  showAuthActions?: boolean;
}

export function PublicShell({ children, showAuthActions = true }: PublicShellProps) {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <div className="relative min-h-screen bg-background">
      {!isLanding && <SceneBackdrop />}
      <header
        className={cn(
          'sticky top-0 z-20 w-full border-b border-white/[0.06] bg-background/75 backdrop-blur-xl'
        )}
      >
        <div className="mx-auto flex h-shell w-full max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
          <BrandMark />
          <div className="flex shrink-0 items-center justify-end gap-2">
            {isLanding && (
              <Link
                to="/turfs"
                className="type-label hidden text-muted transition-colors hover:text-foreground sm:inline"
              >
                Browse fields
              </Link>
            )}
            {showAuthActions && (
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
        </div>
      </header>
      <main className="relative z-10 min-w-0">{children}</main>
    </div>
  );
}
