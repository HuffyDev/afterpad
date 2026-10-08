import { useState } from 'react';

/** Uses /logo.png when present (client/public/logo.png), else the SVG mark. */
export function LogoMark({ size = 26 }: { size?: number }) {
  const [png, setPng] = useState(true);
  if (png) return <img src="/logo.png" alt="" width={size} height={size} className="rounded-md" onError={() => setPng(false)} />;
  return <img src="/favicon.svg" alt="" width={size} height={size} className="rounded-md" />;
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]">
        <LogoMark />
      </span>
      <span className="font-mono text-[13px] font-semibold tracking-[0.22em] text-ink-100">
        AFTER<span className="text-glow">·</span>PAD
      </span>
    </span>
  );
}
