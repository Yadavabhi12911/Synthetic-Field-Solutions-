import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export function SceneBackdrop() {
  const reduce = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.35);
  const spring = { stiffness: 80, damping: 22, mass: 0.9 };
  const rotateY = useSpring(useTransform(x, [0, 1], [8, -8]), spring);
  const rotateX = useSpring(useTransform(y, [0, 1], [12, 4]), spring);

  useEffect(() => {
    if (reduce) return undefined;
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX / window.innerWidth);
      y.set(event.clientY / window.innerHeight);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduce, x, y]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_-10%,rgb(var(--color-primary)/0.16),transparent_52%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,rgb(var(--color-primary)/0.08),transparent_40%)]" />
      <div className="pitch-stage absolute inset-x-0 bottom-[-18%] flex justify-center opacity-[0.17]">
        <motion.div
          className="h-[280px] w-[560px] sm:h-[340px] sm:w-[720px]"
          style={reduce ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        >
          <div
            className="pitch-iso h-full w-full rounded-sm"
            style={{
              background: `
                linear-gradient(90deg, rgb(255 255 255 / 0.85), rgb(255 255 255 / 0.85)) 50% / 2px 100% no-repeat,
                repeating-linear-gradient(90deg, #1a8f58 0 36px, #157a4b 36px 72px)
              `,
              boxShadow: 'inset 0 0 0 3px rgb(255 255 255 / 0.7)',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
