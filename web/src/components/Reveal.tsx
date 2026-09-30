'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

/**
 * Scroll-triggered fade/slide-in, matching the [data-reveal] behaviour from
 * the legacy static site (IntersectionObserver, threshold .14, rootMargin
 * "0px 0px -8% 0px", reveals once). `small` mirrors the `.reveal-sm` variant
 * (shorter travel distance, faster transition) used for text inside cards.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  small = false,
  className = '',
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  small?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduceMotion) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: delay ? `${delay}s` : undefined }}
      className={`transition-[opacity,transform] ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:!opacity-100 motion-reduce:!transition-none motion-reduce:!translate-y-0 ${
        small ? 'duration-500' : 'duration-700'
      } ${visible ? 'opacity-100 translate-y-0' : small ? 'opacity-0 translate-y-[10px]' : 'opacity-0 translate-y-[22px]'} ${className}`}
    >
      {children}
    </Tag>
  );
}
