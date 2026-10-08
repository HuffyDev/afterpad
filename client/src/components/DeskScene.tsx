import { useEffect, useState } from 'react';

/**
 * The empty dev desk at night. Pure SVG; the only light source is the monitor.
 * Screen text types itself out, then the cursor blinks forever.
 */
const LINES = [
  { t: '$ afterpad launch --ticker AFTER', c: '#b3ab9f' },
  { t: '  ✓ metadata pinned', c: '#8a8379' },
  { t: '  ✓ signed in wallet', c: '#8a8379' },
  { t: '  ✓ live on pump.fun', c: '#8a8379' },
  { t: '$ logout', c: '#b3ab9f' },
  { t: '> dev disconnected', c: '#e2674f' },
  { t: '> after: online', c: '#ffc77a' },
];

export function DeskScene({ className = '' }: { className?: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return setShown(LINES.length);
    if (shown >= LINES.length) return;
    const t = window.setTimeout(() => setShown((s) => s + 1), shown === 0 ? 700 : shown === 4 ? 1400 : 520);
    return () => window.clearTimeout(t);
  }, [shown]);

  return (
    <svg viewBox="0 0 640 520" className={className} role="img" aria-label="An empty desk at night, a single monitor glowing">
      <defs>
        <radialGradient id="ds-wash" cx="50%" cy="42%" r="60%">
          <stop offset="0" stopColor="#f3a649" stopOpacity=".28" />
          <stop offset=".45" stopColor="#f3a649" stopOpacity=".07" />
          <stop offset="1" stopColor="#f3a649" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ds-desk" cx="50%" cy="0%" r="70%">
          <stop offset="0" stopColor="#f3a649" stopOpacity=".32" />
          <stop offset=".6" stopColor="#f3a649" stopOpacity=".04" />
          <stop offset="1" stopColor="#f3a649" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ds-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d140a" />
          <stop offset="1" stopColor="#120c06" />
        </linearGradient>
        <linearGradient id="ds-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#15120f" />
          <stop offset="1" stopColor="#0b0a09" />
        </linearGradient>
        <linearGradient id="ds-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f1a14" />
          <stop offset="1" stopColor="#2a2118" />
        </linearGradient>
        <linearGradient id="ds-window" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f1114" />
          <stop offset="1" stopColor="#0c0c0d" />
        </linearGradient>
        <filter id="ds-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id="ds-soft">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <clipPath id="ds-screen-clip">
          <rect x="214" y="132" width="212" height="132" rx="3" />
        </clipPath>
      </defs>

      {/* wall */}
      <rect width="640" height="520" fill="#0b0a09" />
      {/* window with blinds, distant city */}
      <g opacity=".9">
        <rect x="34" y="40" width="150" height="190" fill="url(#ds-window)" stroke="#1a1816" strokeWidth="3" />
        {[...Array(12)].map((_, i) => (
          <rect key={i} x="40" y={48 + i * 15} width="138" height="2" fill="#16181b" />
        ))}
        {[
          [52, 196, 1], [66, 188, 0.6], [80, 204, 0.8], [104, 192, 0.5], [118, 210, 1], [140, 198, 0.7], [160, 206, 0.6], [92, 214, 0.4], [150, 214, 0.9],
        ].map(([x, y, o], i) => (
          <rect key={i} x={x} y={y} width="2.5" height="2.5" fill="#d9c8a2" opacity={o * 0.35} />
        ))}
        <rect x="34" y="226" width="150" height="6" fill="#141210" />
      </g>

      {/* light wash on the wall */}
      <ellipse cx="320" cy="210" rx="300" ry="200" fill="url(#ds-wash)" className="animate-flicker" />

      {/* desk */}
      <polygon points="40,338 600,338 640,372 0,372" fill="url(#ds-top)" />
      <polygon points="40,338 600,338 640,372 0,372" fill="url(#ds-desk)" className="animate-flicker" />
      <rect x="0" y="372" width="640" height="148" fill="url(#ds-front)" />
      <rect x="0" y="372" width="640" height="1.5" fill="#f3a649" opacity=".22" />

      {/* monitor glow behind */}
      <rect x="200" y="122" width="240" height="152" rx="8" fill="#f3a649" opacity=".55" filter="url(#ds-blur)" className="animate-flicker" />

      {/* monitor */}
      <rect x="306" y="276" width="28" height="44" fill="#141210" />
      <rect x="307" y="276" width="2" height="44" fill="#f3a649" opacity=".25" />
      <path d="M270 330 Q320 318 370 330 L374 338 L266 338 Z" fill="#17140f" />
      <path d="M272 331 Q320 320 368 331" stroke="#f3a649" strokeOpacity=".35" fill="none" />
      <rect x="204" y="122" width="232" height="152" rx="7" fill="#100e0c" stroke="#26221d" />
      <rect x="214" y="132" width="212" height="132" rx="3" fill="url(#ds-screen)" />
      <g clipPath="url(#ds-screen-clip)" className="animate-flicker">
        <rect x="214" y="132" width="212" height="132" fill="#f3a649" opacity=".05" />
        <g fontFamily="JetBrains Mono, monospace" fontSize="8.4">
          {LINES.slice(0, shown).map((l, i) => (
            <text key={i} x="224" y={152 + i * 14} fill={l.c} opacity={i === LINES.length - 1 ? 1 : 0.9}>
              {l.t}
            </text>
          ))}
          <rect
            x={224 + (shown > 0 ? LINES[shown - 1].t.length * 5.06 + 3 : 0)}
            y={144 + Math.max(0, shown - 1) * 14}
            width="5"
            height="10"
            fill="#ffc77a"
            className="animate-blink"
          />
        </g>
        <rect x="214" y="132" width="212" height="132" fill="url(#ds-wash)" opacity=".4" />
        {[...Array(44)].map((_, i) => (
          <rect key={i} x="214" y={132 + i * 3} width="212" height="1" fill="#000" opacity=".18" />
        ))}
      </g>
      <circle cx="320" cy="270" r="1.3" fill="#ffc77a" opacity=".8" />

      {/* keyboard */}
      <polygon points="236,346 404,346 414,360 226,360" fill="#191612" />
      <polygon points="236,346 404,346 414,360 226,360" fill="#f3a649" opacity=".12" />
      {[0, 1, 2].map((r) => (
        <line key={r} x1={240 - r * 3} y1={349.5 + r * 3.6} x2={400 + r * 3} y2={349.5 + r * 3.6} stroke="#f3a649" strokeOpacity=".16" strokeDasharray="5 2" />
      ))}

      {/* mouse */}
      <ellipse cx="452" cy="354" rx="9" ry="5.5" fill="#1a1612" />
      <ellipse cx="451" cy="352.5" rx="6" ry="2.4" fill="#f3a649" opacity=".12" />

      {/* mug, cold now */}
      <g>
        <rect x="140" y="312" width="30" height="34" rx="3" fill="#16130f" />
        <rect x="166" y="312" width="4" height="34" fill="#f3a649" opacity=".22" />
        <path d="M170 320 q12 2 0 18" stroke="#16130f" strokeWidth="5" fill="none" />
        <ellipse cx="155" cy="312" rx="15" ry="3" fill="#0e0c0a" />
      </g>

      {/* sticky note */}
      <g transform="rotate(-4 452 150)">
        <rect x="438" y="134" width="30" height="30" fill="#2a2216" />
        <rect x="438" y="134" width="30" height="30" fill="#f3a649" opacity=".12" />
        <text x="443" y="152" fontFamily="JetBrains Mono, monospace" fontSize="6.5" fill="#8a7550">brb</text>
      </g>

      {/* empty chair pushed back, rim-lit */}
      <g transform="translate(470 290) rotate(9)">
        <rect x="0" y="0" width="96" height="120" rx="18" fill="#0d0c0b" />
        <path d="M18 2 Q48 -6 78 2" stroke="#f3a649" strokeOpacity=".28" strokeWidth="2" fill="none" filter="url(#ds-soft)" />
        <rect x="2" y="2" width="3" height="100" rx="1.5" fill="#f3a649" opacity=".16" />
        <rect x="-12" y="128" width="120" height="16" rx="7" fill="#0d0c0b" />
        <rect x="-12" y="128" width="120" height="2" rx="1" fill="#f3a649" opacity=".14" />
        <rect x="42" y="144" width="10" height="60" fill="#0a0908" />
      </g>

      {/* floor shadow fade */}
      <rect x="0" y="440" width="640" height="80" fill="#080706" opacity=".6" />
    </svg>
  );
}
