import React from 'react';
import { useLocation } from 'react-router-dom';
import { OperatorShell } from './OperatorShell';
import { PlayerShell } from './PlayerShell';
import { PublicShell } from './PublicShell';

interface AppShellProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/register',
  '/admin/login',
  '/admin/register',
]);

const AUTH_ONLY_ROUTES = new Set([
  '/login',
  '/register',
  '/admin/login',
  '/admin/register',
]);

function getShellType(pathname: string): 'public' | 'player' | 'operator' {
  if (PUBLIC_ROUTES.has(pathname)) {
    return 'public';
  }
  if (pathname.startsWith('/admin')) {
    return 'operator';
  }
  return 'player';
}

export function AppShell({ children }: AppShellProps) {
  const { pathname } = useLocation();
  const shellType = getShellType(pathname);

  if (shellType === 'operator') {
    return <OperatorShell>{children}</OperatorShell>;
  }

  if (shellType === 'player') {
    return <PlayerShell>{children}</PlayerShell>;
  }

  return (
    <PublicShell showAuthActions={!AUTH_ONLY_ROUTES.has(pathname)}>
      {children}
    </PublicShell>
  );
}
