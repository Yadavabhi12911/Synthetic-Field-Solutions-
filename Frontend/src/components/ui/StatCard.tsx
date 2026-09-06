import type { ComponentType } from 'react';
import { TiltSurface } from '../landing/TiltSurface';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ComponentType<{ className?: string }>;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <TiltSurface intensity="subtle" className="h-full">
      <div className="p-5 text-left">
        {Icon && <Icon className="mb-3 h-5 w-5 text-primary" />}
        <div className="type-numeric text-2xl text-foreground">{value}</div>
        <div className="type-meta mt-1">{label}</div>
      </div>
    </TiltSurface>
  );
}
