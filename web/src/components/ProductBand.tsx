import type { ReactNode } from 'react';
import styles from './ProductBand.module.css';

/** Full-width `<section>` with the legacy "product band" background (hairline, corner blob, variant tint). */
export function ProductBand({
  id,
  variant,
  className = '',
  children,
}: {
  id: string;
  variant: 'club' | 'pilot' | 'email';
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`${styles.band} ${styles[variant]} ${className}`}>
      {children}
    </section>
  );
}
