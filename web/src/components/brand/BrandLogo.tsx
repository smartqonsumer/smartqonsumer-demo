import { getTheme } from '@/lib/brand/theme';

/** Brand lockup: monogram (or paw badge) + wordmark, optional tagline. */
export function BrandLogo({
  preset,
  inverted = false,
  showTagline = false,
}: {
  preset?: string;
  inverted?: boolean;
  showTagline?: boolean;
}) {
  const theme = getTheme(preset);
  const { assets } = theme;
  const ink = inverted ? 'text-white' : 'text-club-ink';

  if (theme.typography === 'serif') {
    return (
      <span className="inline-flex items-center gap-2.5 sm:gap-3" aria-label={theme.name}>
        {assets.logoImage && (
          // eslint-disable-next-line @next/next/no-img-element -- small static monogram
          <img src={assets.logoImage} alt="" width={154} height={196} className="h-12 w-auto shrink-0 sm:h-14" />
        )}
        <span aria-hidden="true" className={`flex flex-col font-club-title leading-none ${ink}`}>
          <span className="text-[1.6rem] font-semibold uppercase tracking-[0.08em] sm:text-3xl">{assets.logoText}</span>
          {assets.logoSubtext && (
            <span className="mt-0.5 text-[0.8rem] font-semibold uppercase tracking-[0.2em] sm:text-sm">{assets.logoSubtext}</span>
          )}
          {showTagline && (
            <span className={`mt-1.5 hidden font-club-text text-[0.6rem] uppercase tracking-[0.18em] sm:block ${inverted ? 'text-white/80' : 'text-club-muted'}`}>
              {assets.tagline}
            </span>
          )}
        </span>
      </span>
    );
  }

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
      <span aria-hidden="true" className={`font-club-title text-2xl font-extrabold uppercase italic leading-none tracking-wide ${ink}`}>
        {assets.logoText}
      </span>
    </span>
  );
}
