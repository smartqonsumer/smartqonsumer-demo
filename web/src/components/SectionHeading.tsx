import type { ReactNode } from 'react';
import { Reveal } from '@/components/Reveal';

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = true,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  center?: boolean;
}) {
  return (
    <Reveal className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-800">{eyebrow}</div>
      <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.014em] text-neutral-950 sm:text-3xl">
        {title}
      </h2>
      {description ? <p className="mt-4 text-base leading-relaxed text-neutral-700">{description}</p> : null}
    </Reveal>
  );
}
