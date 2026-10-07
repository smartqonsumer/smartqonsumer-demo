import styles from './DogRace.module.css';

/** Side-view cartoon dog facing right. Legs/tail animate while `running`. */
export function Dog({ coat = '#C98B4B', running = false, eating = false, className = '' }: {
  coat?: string;
  running?: boolean;
  eating?: boolean;
  className?: string;
}) {
  const state = `${running ? styles.running : ''} ${eating ? styles.eating : ''}`;
  return (
    <svg viewBox="0 0 120 80" aria-hidden="true" className={`${styles.dog} ${state} ${className}`}>
      <g className={styles.tail}>
        <path d="M22 34 Q8 22 12 10" stroke={coat} strokeWidth="6" strokeLinecap="round" fill="none" />
      </g>
      <g className={styles.legBack}>
        <rect x="26" y="44" width="8" height="26" rx="4" fill={coat} />
      </g>
      <g className={styles.legFront}>
        <rect x="72" y="44" width="8" height="26" rx="4" fill={coat} />
      </g>
      <ellipse cx="52" cy="40" rx="34" ry="17" fill={coat} />
      <ellipse cx="52" cy="46" rx="22" ry="8" fill="#fff" opacity="0.35" />
      <g className={styles.legBack2}>
        <rect x="34" y="46" width="8" height="24" rx="4" fill={coat} filter="brightness(0.85)" />
      </g>
      <g className={styles.legFront2}>
        <rect x="64" y="46" width="8" height="24" rx="4" fill={coat} filter="brightness(0.85)" />
      </g>
      <g className={styles.head}>
        <circle cx="90" cy="26" r="15" fill={coat} />
        <ellipse cx="104" cy="31" rx="10" ry="7" fill={coat} />
        <ellipse cx="104" cy="33" rx="7" ry="4" fill="#fff" opacity="0.4" />
        <circle cx="113" cy="29" r="3.2" fill="#141414" />
        <circle cx="94" cy="21" r="2.6" fill="#141414" />
        <circle cx="95" cy="20" r="0.9" fill="#fff" />
        <path d="M80 14 Q74 30 84 34 Q88 22 86 13 Z" fill="#141414" opacity="0.55" />
        <rect x="76" y="36" width="20" height="5" rx="2.5" fill="#B0002F" />
      </g>
    </svg>
  );
}

export function Bowl({ full = true }: { full?: boolean }) {
  return (
    <svg viewBox="0 0 80 44" aria-hidden="true" className={styles.bowl}>
      {full && (
        <g className={styles.kibbles}>
          {[14, 24, 34, 44, 54, 64, 20, 30, 40, 50, 60].map((x, i) => (
            <circle key={i} cx={x} cy={i < 6 ? 18 : 12} r="5" fill={i % 2 ? '#8B5A2B' : '#A86B32'} />
          ))}
        </g>
      )}
      <path d="M4 20 H76 L66 42 H14 Z" fill="#B0002F" />
      <rect x="2" y="17" width="76" height="6" rx="3" fill="#8A0024" />
    </svg>
  );
}
