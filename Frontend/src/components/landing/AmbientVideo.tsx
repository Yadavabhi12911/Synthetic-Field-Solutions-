import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface AmbientVideoProps {
  src: string;
  label: string;
  framed?: boolean;
  className?: string;
  videoClassName?: string;
  overlayClassName?: string;
  children?: ReactNode;
}

export function AmbientVideo({
  src,
  label,
  framed = true,
  className,
  videoClassName,
  overlayClassName,
  children,
}: AmbientVideoProps) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stageEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (reduce) {
          video.pause();
          return;
        }
        if (entry.isIntersecting) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(stageEl);
    return () => observer.disconnect();
  }, [reduce, stageEl]);

  const media = (
    <div className="relative h-full w-full overflow-hidden bg-[#07090b]">
      <video
        ref={videoRef}
        className={cn('h-full w-full object-cover', videoClassName)}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        autoPlay={!reduce}
        controls={false}
        aria-label={label}
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15',
          overlayClassName
        )}
      />
      {children}
    </div>
  );

  if (!framed) {
    return (
      <div ref={setStageEl} className={cn('h-full w-full', className)}>
        {media}
      </div>
    );
  }

  return (
    <div
      ref={setStageEl}
      className={cn(
        'rounded-[1.75rem] border border-white/[0.08] bg-white/[0.04] p-1.5 shadow-modal',
        className
      )}
    >
      <div className="overflow-hidden rounded-[calc(1.75rem-0.35rem)]">{media}</div>
    </div>
  );
}
