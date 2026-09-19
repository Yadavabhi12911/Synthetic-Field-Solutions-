import { AmbientVideo } from './AmbientVideo';

export function HeroVideo({ className }: { className?: string }) {
  return (
    <AmbientVideo
      src="/hero-sports-complex.mp4"
      label="Sports complex commercial"
      className={className}
      videoClassName="aspect-[4/3] lg:aspect-auto lg:h-[520px]"
    />
  );
}
