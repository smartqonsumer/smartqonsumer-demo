import type { ReactNode } from 'react';
import { Reveal } from '@/components/Reveal';

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = true,
  pill = false,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  center?: boolean;
  /** Badge-style eyebrow used inside `.product-band` sections (how/club/email/pilot) on the legacy site. */
  pill?: boolean;
}) {
  return (
    <Reveal className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      <span
        className={
          pill
            ? 'eyebrow-pill text-xs font-bold uppercase tracking-[0.1em] text-brand-800'
            : 'block text-xs font-semibold uppercase tracking-[0.1em] text-brand-800'
        }
      >
        {eyebrow}
      </span>
      <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.014em] text-neutral-950 sm:text-3xl">
        {title}
      </h2>
      {description ? <p className="mt-4 text-base leading-relaxed text-neutral-700">{description}</p> : null}
    </Reveal>
  );
}
