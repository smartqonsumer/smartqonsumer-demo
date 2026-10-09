'use client';

/**
 * SmartQonsumer core UI for the brand journeys. Every colour comes from the brand theme
 * (`club-*`), every touch target is ≥ 48px, focus is always visible.
 */
import Link from 'next/link';
import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, forwardRef, useId } from 'react';

const focus = 'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-club-ink';

const buttonStyles = {
  primary: 'bg-club-primary text-club-primary-contrast hover:bg-club-primary-dark shadow-md',
  secondary: 'bg-club-surface text-club-ink border-2 border-club-ink hover:bg-club-background',
  ghost: 'bg-transparent text-club-ink underline underline-offset-4 hover:text-club-primary',
} as const;

type ButtonVariant = keyof typeof buttonStyles;

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0">
      <path d="M4 12h15m-5-5 5 5-5 5" />
    </svg>
  );
}

const buttonBase = `club-button inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-club-title text-lg font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${focus}`;

export function Button({
  variant = 'primary',
  loading = false,
  arrow = false,
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; loading?: boolean; arrow?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      aria-busy={loading || undefined}
      className={`${buttonBase} ${buttonStyles[variant]} ${className}`}
    >
      {loading && <Spinner />}
      {children}
      {arrow && !loading && <Arrow />}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = 'primary',
  arrow = false,
  children,
  className = '',
}: {
  href: string;
  variant?: ButtonVariant;
  arrow?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const external = /^https?:\/\//.test(href);
  const classes = `${buttonBase} ${buttonStyles[variant]} ${className}`;
  return external ? (
    <a href={href} className={classes}>
      {children}
      {arrow && <Arrow />}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2" role={label ? 'status' : undefined}>
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-[3px] border-current border-t-transparent motion-reduce:animate-none"
      />
      {label && <span>{label}</span>}
    </span>
  );
}

export function Card({ children, className = '', as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article' | 'li' }) {
  return <Tag className={`rounded-club-lg border border-club-border bg-club-surface p-5 shadow-sm ${className}`}>{children}</Tag>;
}

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'success' | 'info'; children: ReactNode }) {
  const styles = {
    error: 'border-club-primary/40 bg-club-primary/5',
    success: 'border-club-accent/50 bg-club-accent-soft',
    info: 'border-club-accent/50 bg-club-surface',
  }[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-club-md border p-4 text-base text-club-ink ${styles}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className={`mt-px h-6 w-6 shrink-0 ${tone === 'error' ? 'text-club-primary' : 'text-club-accent-text'}`} fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="10" />
        {tone === 'success' ? <path d="m7.5 12.5 3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M12 7v6m0 3.5v.5" strokeLinecap="round" />}
      </svg>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function Heading({ children, level = 1, className = '' }: { children: ReactNode; level?: 1 | 2 | 3; className?: string }) {
  const Tag = `h${level}` as 'h1';
  const size = { 1: 'text-4xl sm:text-5xl', 2: 'text-3xl', 3: 'text-xl' }[level];
  return (
    <Tag className={`club-heading font-club-title font-extrabold uppercase leading-[0.95] text-club-ink ${size} ${className}`}>
      {children}
      {level === 1 && <span aria-hidden="true" className="club-heading-rule" />}
    </Tag>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  icon?: 'email' | 'lock' | 'user';
  /** Control placed inside the field, on the right (e.g. show-password toggle). */
  trailing?: ReactNode;
};

const fieldIcons = {
  email: <path d="M3.5 6.5h17v11h-17zM3.5 7l8.5 6.5L20.5 7" />,
  lock: <path d="M6 10.5h12v9H6zM8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v1.5" />,
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0" />,
};

export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField({ label, error, hint, id, icon, trailing, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = [error && `${inputId}-error`, hint && `${inputId}-hint`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-base font-semibold text-club-ink">
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <div className="relative">
        {icon && (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-club-muted">
            {fieldIcons[icon]}
          </svg>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
          className={`min-h-[52px] w-full rounded-club-md border-2 bg-club-surface text-lg text-club-ink placeholder:text-club-muted ${icon ? 'pl-11' : 'pl-4'} ${
            trailing ? 'pr-14' : 'pr-4'
          } ${error ? 'border-club-primary' : 'border-club-border'} ${focus}`}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {hint && (
        <p id={`${inputId}-hint`} className="text-sm text-club-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-sm font-semibold text-club-primary">
          {error}
        </p>
      )}
    </div>
  );
});

export function Checkbox({
  label,
  checked,
  onChange,
  required,
  error,
  name,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  error?: string;
  name: string;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.checked)}
          className={`mt-0.5 h-6 w-6 shrink-0 cursor-pointer accent-club-primary ${focus}`}
        />
        <label htmlFor={id} className="cursor-pointer text-base leading-snug text-club-text">
          {label}
          {required && <span className="sr-only"> (obligatoire)</span>}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="ml-9 mt-1 text-sm font-semibold text-club-primary">
          {error}
        </p>
      )}
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="h-4 w-full overflow-hidden rounded-full bg-club-accent/25"
    >
      <div className="h-full rounded-full bg-club-accent transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${percent}%` }} />
    </div>
  );
}

export function PointsBadge({ points, className = '' }: { points: number; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-club-gold px-3 py-1 font-club-title text-base font-bold text-club-ink ${className}`}>
      +{points} pts
    </span>
  );
}

export const focusRing = focus;
