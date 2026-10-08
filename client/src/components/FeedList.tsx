import { Link } from 'react-router-dom';
import type { TokenView } from '../../../shared/launch';
import { ago, short, usd } from '../lib/format';
import { useNow } from '../lib/hooks';
import { Skeleton, TokenAvatar } from './bits';
import { Icon } from './Icon';

export function FeedList({ tokens, loading, emptyCta = true }: { tokens: TokenView[] | null; loading: boolean; emptyCta?: boolean }) {
  const now = useNow();
  if (loading && !tokens)
    return (
      <div className="overflow-hidden rounded-2xl border border-ink-700">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-ink-700/60 bg-ink-850 px-4 py-4 last:border-0">
            <Skeleton className="h-11 w-11" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  if (!tokens?.length) return <Empty cta={emptyCta} />;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-850">
      <div className="hidden grid-cols-[minmax(0,2.2fr)_1fr_0.8fr_1fr_0.7fr_24px] gap-4 border-b border-ink-700 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500 md:grid">
        <span>coin</span>
        <span>creator</span>
        <span>launched</span>
        <span className="text-right">mcap</span>
        <span className="text-right">24h</span>
        <span />
      </div>
      <ul>
        {tokens.map((t) => (
          <li key={t.launchId} className="border-b border-ink-700/60 last:border-0">
            <Link
              to={`/token/${t.mint}`}
              className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 transition hover:bg-ink-800/70 sm:px-5 md:grid-cols-[minmax(0,2.2fr)_1fr_0.8fr_1fr_0.7fr_24px] md:gap-4"
            >
              <span className="flex min-w-0 items-center gap-3.5">
                <TokenAvatar src={t.imageUri} ticker={t.ticker} size={44} />
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium text-ink-100">{t.name}</span>
                    {t.simulated && <span className="badge shrink-0 border-glow/30 px-1.5 py-0 text-[9px] text-glow/90">sim</span>}
                  </span>
                  <span className="num flex items-center gap-2 text-xs text-ink-400">
                    <span className="text-glow/90">${t.ticker}</span>
                    <span className="text-ink-600 md:hidden">·</span>
                    <span className="md:hidden">{ago(t.createdAt, now)}</span>
                  </span>
                </span>
              </span>
              <span className="num hidden text-[13px] text-ink-400 md:block">{short(t.creator)}</span>
              <span className="num hidden text-[13px] text-ink-400 md:block">{ago(t.createdAt, now)}</span>
              <span className="num text-right text-[15px] text-ink-100 md:text-sm">{usd(t.marketCapUsd)}</span>
              <span className={`num hidden text-right text-[13px] md:block ${t.priceChange24h == null ? 'text-ink-500' : t.priceChange24h >= 0 ? 'text-ok' : 'text-bad'}`}>
                {t.priceChange24h == null ? '—' : `${t.priceChange24h >= 0 ? '+' : ''}${t.priceChange24h.toFixed(1)}%`}
              </span>
              <Icon name="chevron" className="hidden text-ink-600 transition group-hover:translate-x-0.5 group-hover:text-glow md:block" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Empty({ cta }: { cta: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-ink-700 bg-ink-850/50 px-6 py-16 text-center">
      <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-72 -translate-x-1/2 rounded-full bg-glow/10 blur-3xl" />
      <div className="relative">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-ink-700 bg-ink-900 text-ink-500">
          <Icon name="terminal" size={20} />
        </div>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">› no coins yet</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight">The desk is empty.</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-400">Every coin launched through AFTER PAD shows up here with live market cap.</p>
        {cta && (
          <Link to="/launch" className="btn-glow mt-6">
            Be the first <Icon name="arrow" />
          </Link>
        )}
      </div>
    </div>
  );
}
