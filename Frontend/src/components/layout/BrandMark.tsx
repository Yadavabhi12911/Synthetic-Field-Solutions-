import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

interface BrandMarkProps {
  compact?: boolean;
  className?: string;
}

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <Link
      to="/"
      aria-label="Turfly home"
      className={cn(
        'relative block shrink-0 overflow-hidden',
        compact ? 'h-9 w-9' : 'h-9 w-9 sm:h-11 sm:w-11',
        className
      )}
    >
      <img
        src="/Turfly-logo.png"
        alt=""
        width={44}
        height={44}
        className="h-full w-full object-contain brightness-0 invert [transform:scale(1.72)]"
      />
    </Link>
  );
}
