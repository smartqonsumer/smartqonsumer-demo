'use client';

import { useEffect, useRef, useState } from 'react';
import { Alert, Button } from '@/components/ui';
import { errorMessage } from '@/lib/api/client';
import type { GamePlayResponse, RouletteDisplay, RouletteOutcome } from '@/lib/api/types';
import { wheelRotationFor } from './wheel';

const SPIN_MS = 4200;
const FALLBACK_COLORS = ['#B0002F', '#141414', '#6E9E00', '#F2B705'];

/** Keep labels readable: those on the lower half are flipped right side up. */
function labelAngle(angle: number) {
  return angle > 90 && angle < 270 ? angle + 180 : angle;
}

function polar(angleDeg: number, r: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [100 + r * Math.cos(a), 100 + r * Math.sin(a)] as const;
}

/**
 * Wheel of fortune. Segments come from the backend; the server draws the winning
 * segment and the wheel only spins until it stops on it.
 */
export function Roulette({
  display,
  play,
  onComplete,
  disabledMessage,
}: {
  display: RouletteDisplay;
  play: () => Promise<GamePlayResponse>;
  onComplete: (result: GamePlayResponse) => void;
  disabledMessage?: string | null;
}) {
  const segments = display.segments;
  const size = 360 / Math.max(segments.length, 1);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announce, setAnnounce] = useState('');
  const [reduced, setReduced] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setReduced(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
    return () => {
      mounted.current = false;
    };
  }, []);

  async function spin() {
    setError(null);
    setSpinning(true);
    setAnnounce('La roue tourne…');
    try {
      const response = await play();
      const outcome = response.outcome as RouletteOutcome;
      setRotation((current) => wheelRotationFor(current, outcome.segment_index, segments.length, reduced ? 0 : 6));
      if (!reduced) await new Promise((resolve) => setTimeout(resolve, SPIN_MS + 150));
      if (!mounted.current) return;
      setAnnounce(`Résultat : ${outcome.label} points.`);
      onComplete(response);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      if (mounted.current) setSpinning(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      <div className="relative w-full max-w-[320px]">
        <svg viewBox="0 0 200 200" className="w-full drop-shadow-lg" role="img" aria-label={`Roue : ${segments.map((s) => s.label).join(', ')}`}>
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: '100px 100px',
              transition: reduced ? 'none' : `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.6, 0.12, 1)`,
            }}
          >
            {segments.map((segment, i) => {
              const [x1, y1] = polar(i * size, 96);
              const [x2, y2] = polar((i + 1) * size, 96);
              const [tx, ty] = polar((i + 0.5) * size, 62);
              const fill = segment.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]!;
              const darkText = fill.toUpperCase() === '#F2B705';
              return (
                <g key={i}>
                  <path d={`M100 100 L${x1} ${y1} A96 96 0 ${size > 180 ? 1 : 0} 1 ${x2} ${y2} Z`} fill={fill} stroke="#fff" strokeWidth="2" />
                  <text
                    x={tx}
                    y={ty}
                    fill={darkText ? '#141414' : '#fff'}
                    fontSize="18"
                    fontWeight="800"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${labelAngle((i + 0.5) * size)} ${tx} ${ty})`}
                    style={{ fontFamily: 'var(--font-club-title)' }}
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}
          </g>
          <circle cx="100" cy="100" r="16" fill="#141414" stroke="#fff" strokeWidth="3" />
          <path d="M100 0 L110 18 H90 Z" fill="#141414" stroke="#fff" strokeWidth="2" />
        </svg>
      </div>
      {error && <Alert>{error}</Alert>}
      {disabledMessage ? (
        <Alert tone="info">{disabledMessage}</Alert>
      ) : (
        <Button onClick={spin} loading={spinning}>
          {spinning ? 'La roue tourne…' : 'Lancer la roue'}
        </Button>
      )}
    </div>
  );
}
