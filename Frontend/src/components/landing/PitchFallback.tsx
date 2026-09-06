import { cn } from '../../lib/cn';

export function PitchFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn('pitch-stage relative isolate flex h-full min-h-[320px] items-center justify-center overflow-hidden', className)}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(34_160_107/0.18),transparent_62%)]" />
      <div
        className="pitch-iso h-[210px] w-[340px] rounded-sm shadow-[0_28px_60px_rgb(0_0_0/0.45)] sm:h-[250px] sm:w-[420px]"
        style={{
          background: `
            linear-gradient(90deg, rgb(255 255 255 / 0.88), rgb(255 255 255 / 0.88)) 50% / 2px 100% no-repeat,
            repeating-linear-gradient(90deg, #1a8f58 0 28px, #157a4b 28px 56px)
          `,
          boxShadow: 'inset 0 0 0 3px rgb(255 255 255 / 0.9), 0 40px 70px rgb(0 0 0 / 0.4)',
        }}
      >
        <div className="absolute left-1/2 top-1/2 h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white/90" />
        <div className="absolute left-[3px] top-1/2 h-[46%] w-[18%] -translate-y-1/2 border-[3px] border-white/90" />
        <div className="absolute right-[3px] top-1/2 h-[46%] w-[18%] -translate-y-1/2 border-[3px] border-white/90" />
        <div className="absolute left-[38%] top-[42%] h-9 w-9 rounded-full bg-primary/70 ring-2 ring-white/80" />
      </div>
    </div>
  );
}
