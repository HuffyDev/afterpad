import { Icon } from './Icon';
import { short, usd } from '../lib/format';

export interface CardData {
  name: string;
  ticker: string;
  description?: string;
  image?: string | null;
  banner?: string | null;
  website?: string | null;
  twitter?: string | null;
  telegram?: string | null;
  creator?: string | null;
  mint?: string | null;
  marketCapUsd?: number | null;
  devBuySol?: number;
  simulated?: boolean;
  afterMode?: boolean;
}

export function TokenCard({ d, preview = false, className = '' }: { d: CardData; preview?: boolean; className?: string }) {
  const name = d.name.trim() || 'Untitled coin';
  const ticker = d.ticker.trim().toUpperCase() || 'TICKER';
  return (
    <article className={`relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-850 shadow-[0_30px_80px_-40px_#000] ${className}`}>
      {/* banner */}
      <div className="relative h-28 overflow-hidden border-b border-ink-700 bg-ink-900">
        {d.banner ? (
          <img src={d.banner} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="scan absolute inset-0">
            <div className="absolute -top-10 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-glow/20 blur-3xl" />
            <div className="absolute bottom-3 right-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">{preview ? 'banner · optional' : 'after pad'}</div>
          </div>
        )}
        {d.simulated && <span className="badge absolute left-3 top-3 border-glow/40 bg-ink-900/80 text-glow backdrop-blur">dry run</span>}
      </div>

      <div className="relative px-5 pb-5">
        <div className="-mt-9 flex items-end justify-between gap-3">
          <div className="grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-xl border border-ink-600 bg-ink-800 shadow-[0_8px_30px_-10px_#000]">
            {d.image ? (
              <img src={d.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <Icon name="image" size={22} className="text-ink-500" />
            )}
          </div>
          <div className="flex gap-1.5 pb-1">
            {[
              { k: 'website', icon: 'globe' as const, v: d.website },
              { k: 'twitter', icon: 'xlogo' as const, v: d.twitter },
              { k: 'telegram', icon: 'telegram' as const, v: d.telegram },
            ].map((l) =>
              l.v ? (
                <a key={l.k} href={l.v} target="_blank" rel="noreferrer" className="grid h-7 w-7 place-items-center rounded-md border border-ink-700 bg-ink-900 text-ink-300 hover:text-glow" aria-label={l.k}>
                  <Icon name={l.icon} size={13} />
                </a>
              ) : preview ? (
                <span key={l.k} className="grid h-7 w-7 place-items-center rounded-md border border-dashed border-ink-700 text-ink-600">
                  <Icon name={l.icon} size={13} />
                </span>
              ) : null,
            )}
          </div>
        </div>

        <div className="mt-3.5 flex items-baseline gap-2">
          <h3 className={`truncate text-xl font-semibold tracking-tight ${d.name.trim() ? 'text-ink-100' : 'text-ink-500'}`}>{name}</h3>
          <span className={`num shrink-0 text-sm ${d.ticker.trim() ? 'text-glow' : 'text-ink-500'}`}>${ticker}</span>
        </div>
        <p className={`mt-2 line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed ${d.description?.trim() ? 'text-ink-300' : 'text-ink-500'}`}>
          {d.description?.trim() || 'Your description shows up here. Say what the coin is, or say nothing — the dev is leaving anyway.'}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-ink-700 bg-ink-700 text-[11px]">
          <Stat label="mcap" value={d.marketCapUsd != null ? usd(d.marketCapUsd) : preview ? '$—' : '—'} />
          <Stat label="dev buy" value={d.devBuySol != null ? `${+d.devBuySol.toFixed(3)} SOL` : '—'} />
          <Stat label="creator" value={d.creator ? short(d.creator) : 'you'} />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em]">
          <span className="truncate text-ink-500">{d.mint ? `ca ${short(d.mint, 6)}` : 'ca · generated at launch'}</span>
          <span className={`flex shrink-0 items-center gap-1.5 ${d.afterMode ? 'text-glow' : 'text-ink-500'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${d.afterMode ? 'bg-glow' : 'bg-ink-600'}`} />
            dev: {d.afterMode ? 'ai' : 'human'}
          </span>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink-900 px-2.5 py-2">
      <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-500">{label}</div>
      <div className="num mt-0.5 truncate text-[12.5px] text-ink-200">{value}</div>
    </div>
  );
}
