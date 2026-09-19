import type { ComponentType } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { Home, LogIn, LogOut, Settings, UserPlus } from 'lucide-react';
import { operatorNavItems, playerNavItems } from '../layout/nav';

export interface CommandItem {
  id: string;
  label: string;
  group: string;
  keywords?: string[];
  icon: ComponentType<{ className?: string }>;
  onSelect: () => void;
}

interface BuildCommandItemsOptions {
  user: { userName?: string } | null;
  userType: 'user' | 'admin' | null;
  navigate: NavigateFunction;
  logout: () => void;
  onClose: () => void;
}

export function buildCommandItems({
  user,
  userType,
  navigate,
  logout,
  onClose,
}: BuildCommandItemsOptions): CommandItem[] {
  const items: CommandItem[] = [];

  const addNav = (
    id: string,
    label: string,
    group: string,
    to: string,
    icon: ComponentType<{ className?: string }>,
    keywords?: string[]
  ) => {
    items.push({
      id,
      label,
      group,
      icon,
      keywords,
      onSelect: () => {
        onClose();
        navigate(to);
      },
    });
  };

  addNav('home', 'Home', 'Pages', '/', Home, ['landing', 'start']);

  if (!user) {
    addNav('browse', 'Browse fields', 'Pages', '/turfs', playerNavItems[0].icon, ['turfs', 'fields']);
    addNav('player-login', 'Player login', 'Account', '/login', LogIn, ['sign in']);
    addNav('player-register', 'Player sign up', 'Account', '/register', UserPlus, ['create account']);
    addNav('operator-login', 'Operator login', 'Account', '/admin/login', LogIn, ['admin sign in']);
    addNav(
      'operator-register',
      'List your field',
      'Account',
      '/admin/register',
      UserPlus,
      ['operator', 'venue', 'register']
    );
    return items;
  }

  if (userType === 'user') {
    playerNavItems.forEach((item) => {
      addNav(`nav-${item.to}`, item.label, 'Navigation', item.to, item.icon);
    });
    addNav('preferences', 'Preferences', 'Account', '/preferences', Settings, [
      'profile',
      'settings',
    ]);
  }

  if (userType === 'admin') {
    operatorNavItems.forEach((item) => {
      addNav(`nav-${item.to}`, item.label, 'Navigation', item.to, item.icon);
    });
  }

  items.push({
    id: 'logout',
    label: 'Logout',
    group: 'Account',
    icon: LogOut,
    keywords: ['sign out', 'exit'],
    onSelect: () => {
      onClose();
      logout();
      navigate('/');
    },
  });

  return items;
}

export function filterCommandItems(items: CommandItem[], query: string): CommandItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;

  return items.filter((item) => {
    const haystack = [item.label, item.group, ...(item.keywords ?? [])]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function groupCommandItems(items: CommandItem[]): Array<{ group: string; items: CommandItem[] }> {
  const groups = new Map<string, CommandItem[]>();

  items.forEach((item) => {
    const existing = groups.get(item.group) ?? [];
    existing.push(item);
    groups.set(item.group, existing);
  });

  return Array.from(groups.entries()).map(([group, groupItems]) => ({
    group,
    items: groupItems,
  }));
}
