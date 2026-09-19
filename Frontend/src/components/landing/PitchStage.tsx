import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { PITCH_SLOTS, type PitchSlot } from './pitchSlots';
import { PitchFallback } from './PitchFallback';
import { cn } from '../../lib/cn';

const PitchCanvas = lazy(() => import('./PitchCanvas'));

class CanvasErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

interface PitchStageProps {
  slots?: PitchSlot[];
  selectedSlotId?: string;
  onSelectSlot?: (id: string) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  className?: string;
}

export function PitchStage({
  slots = PITCH_SLOTS,
  selectedSlotId,
  onSelectSlot,
  title = 'Greenline Arena',
  subtitle = 'Koramangala · illustration',
  compact = false,
  className,
}: PitchStageProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [internalSlotId, setInternalSlotId] = useState(slots[0]?.id ?? PITCH_SLOTS[0].id);
  const [visible, setVisible] = useState(true);
  const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null);
  const activeId = selectedSlotId ?? internalSlotId;
  const selected = slots.find((slot) => slot.id === activeId) ?? slots[0];

  useEffect(() => {
    if (selectedSlotId) return;
    if (!slots.some((slot) => slot.id === internalSlotId)) {
      setInternalSlotId(slots[0]?.id ?? PITCH_SLOTS[0].id);
    }
  }, [internalSlotId, selectedSlotId, slots]);

  useEffect(() => {
    if (!stageEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.12 }
    );
    observer.observe(stageEl);
    return () => observer.disconnect();
  }, [stageEl]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  function handleSelect(id: string) {
    if (!selectedSlotId) setInternalSlotId(id);
    onSelectSlot?.(id);
  }

  return (
    <div
      ref={setStageEl}
      className={cn(
        'rounded-[1.75rem] border border-white/[0.08] bg-white/[0.04] p-1.5 shadow-modal',
        className
      )}
    >
      <div className="relative overflow-hidden rounded-[calc(1.75rem-0.35rem)] bg-[#07090b]">
        <div
          className={cn(
            'relative w-full',
            compact
              ? 'h-[240px] sm:h-[280px]'
              : 'aspect-[4/3] min-h-[280px] sm:min-h-[340px] lg:aspect-auto lg:h-[520px]'
          )}
        >
          {reducedMotion ? (
            <PitchFallback />
          ) : (
            <CanvasErrorBoundary fallback={<PitchFallback />}>
              <Suspense fallback={<PitchFallback />}>
                <PitchCanvas
                  selectedSlotId={activeId}
                  onSelectSlot={handleSelect}
                  paused={!visible}
                  reducedMotion={reducedMotion}
                  slots={slots}
                  compact={compact}
                />
              </Suspense>
            </CanvasErrorBoundary>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-16 text-left sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="type-label text-white">{title}</p>
              {subtitle && <p className="type-meta mt-0.5 text-white/70">{subtitle}</p>}
            </div>
            {selected && (
              <p className="type-numeric type-label text-white">
                {selected.label}
                {selected.price ? ` · ${selected.price}` : ''}
              </p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Time slots">
            {slots.map((slot) => {
              const active = slot.id === activeId;
              const available = slot.available !== false;
              return (
                <button
                  key={slot.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled={!available}
                  onClick={() => handleSelect(slot.id)}
                  className={cn(
                    'rounded-full px-3 py-1.5 type-label transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40',
                    active
                      ? 'bg-primary text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                  )}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
