import { getTheme } from '@/lib/brand/theme';

/** Wordmark of the brand: a paw badge + condensed name. */
export function BrandLogo({ preset, inverted = false }: { preset?: string; inverted?: boolean }) {
  const theme = getTheme(preset);
  return (
    <span className="inline-flex items-center gap-2" aria-label={theme.name}>
      <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8 shrink-0">
        <circle cx="16" cy="16" r="16" className="fill-club-primary" />
        <g className="fill-club-primary-contrast">
          <ellipse cx="16" cy="20" rx="6" ry="5" />
          <circle cx="9.5" cy="13.5" r="2.4" />
          <circle cx="13.5" cy="9.5" r="2.4" />
          <circle cx="18.5" cy="9.5" r="2.4" />
          <circle cx="22.5" cy="13.5" r="2.4" />
        </g>
      </svg>
      <span
        aria-hidden="true"
        className={`font-club-title text-2xl font-extrabold uppercase italic leading-none tracking-wide ${
          inverted ? 'text-white' : 'text-club-ink'
        }`}
      >
        {theme.assets.logoText}
      </span>
    </span>
  );
}
