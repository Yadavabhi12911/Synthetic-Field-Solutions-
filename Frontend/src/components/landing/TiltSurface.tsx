import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import type { PointerEvent, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface TiltSurfaceProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  intensity?: 'subtle' | 'full';
}

export function TiltSurface({
  children,
  className,
  innerClassName,
  intensity = 'full',
}: TiltSurfaceProps) {
  const reduce = useReducedMotion();
  const range = intensity === 'subtle' ? 5 : 11;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 220, damping: 22, mass: 0.7 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [range * 0.8, -range * 0.8]), spring);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-range, range]), spring);
  const glareX = useTransform(x, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(y, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.18), transparent 55%)`;

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className={cn('pitch-stage', className)}>
      <motion.div
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={cn(
          'group relative overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-surface shadow-card will-change-transform',
          innerClassName
        )}
      >
        {!reduce && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glare }}
          />
        )}
        {children}
      </motion.div>
    </div>
  );
}
