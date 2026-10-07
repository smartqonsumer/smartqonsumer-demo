'use client';

declare global {
  interface Window {
    /** Exposed by the Axeptio SDK once loaded: reopens the consent widget. */
    openAxeptioCookies?: () => void;
  }
}

/** Lets visitors change or withdraw their cookie consent at any time (CNIL requirement). */
export function CookieSettingsButton({
  label = 'gérer mes préférences de cookies',
  className = 'text-brand-800 underline underline-offset-2 hover:text-brand-900',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.openAxeptioCookies?.()}
      className={className}
    >
      {label}
    </button>
  );
}
