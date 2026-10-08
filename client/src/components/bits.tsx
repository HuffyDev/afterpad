import type { ReactNode } from 'react';
import { useCopy } from '../lib/hooks';
import { Icon } from './Icon';

export function CopyField({ value, label, className = '' }: { value: string; label?: string; className?: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className={className}>
      {label && <div className="label">{label}</div>}
      <button
        onClick={() => copy(value)}
        className="group flex w-full items-center gap-3 rounded-lg border border-ink-700 bg-ink-900 px-3.5 py-3 text-left transition hover:border-glow/50"
        aria-label={`Copy ${label ?? 'value'}`}
      >
        <span className="num min-w-0 flex-1 break-all text-[13px] text-ink-100">{value}</span>
        <span className={`flex shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest ${copied ? 'text-glow' : 'text-ink-400 group-hover:text-ink-200'}`}>
          <Icon name={copied ? 'check' : 'copy'} size={14} />
          {copied ? 'copied' : 'copy'}
        </span>
      </button>
    </div>
  );
}

export function SoonBadge({ children = 'coming soon' }: { children?: ReactNode }) {
  return (
    <span className="badge-soon">
      <span className="h-1 w-1 rounded-full bg-glow animate-breathe" />
      {children}
    </span>
  );
}

export function SectionHead({ index, eyebrow, title, children, action }: { index?: string; eyebrow: string; title: ReactNode; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="eyebrow flex items-center gap-3">
          {index && <span className="text-glow">{index}</span>}
          <span>{eyebrow}</span>
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tightest text-ink-100 sm:text-4xl">{title}</h2>
        {children && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-400">{children}</p>}
      </div>
      {action}
    </div>
  );
}

export function TokenAvatar({ src, ticker, size = 40, className = '' }: { src?: string | null; ticker: string; size?: number; className?: string }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-lg border border-ink-700 bg-ink-800 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span className="font-mono font-semibold text-ink-400" style={{ fontSize: size * 0.3 }}>
          {ticker.slice(0, 2) || '··'}
        </span>
      )}
    </span>
  );
}

export function ExtLink({ href, children, disabled, className = '' }: { href: string; children: ReactNode; disabled?: boolean; className?: string }) {
  if (disabled)
    return (
      <span className={`btn-ghost cursor-not-allowed opacity-40 ${className}`} title="Available once launched on mainnet">
        {children}
      </span>
    );
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`btn-ghost ${className}`}>
      {children}
      <Icon name="out" size={13} className="text-ink-400" />
    </a>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-ink-800 ${className}`} />;
}
