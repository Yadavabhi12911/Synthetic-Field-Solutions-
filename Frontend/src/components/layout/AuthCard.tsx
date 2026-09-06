import React from 'react';
import { Card, CardBody } from '../ui/Card';
import { cn } from '../../lib/cn';
import { TiltSurface } from '../landing/TiltSurface';

interface AuthCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  icon,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        'relative z-10 flex min-h-[calc(100vh-var(--shell-header-height))] items-center justify-center px-4 py-8',
        className
      )}
    >
      <TiltSurface className="w-full max-w-md" innerClassName="shadow-modal">
        <Card className="border-0 bg-transparent shadow-none hover:border-transparent">
          <CardBody className="p-8 text-left">
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-muted text-primary">
                {icon}
              </div>
              <h1 className="type-title">{title}</h1>
              <p className="type-body type-measure mt-2">{description}</p>
            </div>
            {children}
            {footer && <div className="type-body-sm mt-6">{footer}</div>}
          </CardBody>
        </Card>
      </TiltSurface>
    </div>
  );
}
