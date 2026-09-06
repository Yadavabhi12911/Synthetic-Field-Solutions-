import type { ComponentType } from 'react';
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  MapPin,
  Settings,
  Users,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
}

export const playerNavItems: NavItem[] = [
  { label: 'Browse fields', to: '/turfs', icon: MapPin },
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My bookings', to: '/bookings', icon: CalendarDays },
];

export const operatorNavItems: NavItem[] = [
  { label: 'Fields', to: '/admin/dashboard', icon: MapPin, end: true },
  { label: 'Bookings', to: '/admin/bookings', icon: CalendarDays },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];
