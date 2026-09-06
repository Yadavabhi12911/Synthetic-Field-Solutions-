import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

interface BrandMarkProps {
  compact?: boolean;
  className?: string;
}

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <Link to="/" className={cn('flex items-center gap-3 text-left', className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white">
        SF
      </div>
      {!compact && (
        <div className="min-w-0">
          <div className="type-label truncate">Synthetic Field</div>
          <div className="type-meta truncate">Solutions</div>
        </div>
      )}
    </Link>
  );
}
