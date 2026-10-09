import type { ReactNode } from 'react';

/** Icon-box + title + text row, used by the Club Fidélité and Security/Trust sections. */
export function IconRow({
  icon,
  title,
  text,
  titleClassName = 'text-neutral-950',
  textClassName = 'text-neutral-600',
  iconClassName = 'h-[38px] w-[38px] rounded-[11px] bg-white text-brand-700 shadow-sm',
}: {
  icon: ReactNode;
  title: string;
  text: string;
  titleClassName?: string;
  textClassName?: string;
  iconClassName?: string;
}) {
  return (
    <div className="flex gap-3.5">
      <div className={`grid shrink-0 place-items-center ${iconClassName}`}>
        {icon}
      </div>
      <div>
        <h3 className={`mb-1 text-[15px] font-semibold tracking-[-0.1px] ${titleClassName}`}>{title}</h3>
        <p className={`text-[13px] leading-relaxed ${textClassName}`}>{text}</p>
      </div>
    </div>
  );
}
