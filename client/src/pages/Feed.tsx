import { useMemo, useState } from 'react';
import { FeedList } from '../components/FeedList';
import { Icon, Spinner } from '../components/Icon';
import { api } from '../lib/api';
import { useAsync } from '../lib/hooks';
import { useEffect } from 'react';

export default function Feed() {
  const [sort, setSort] = useState<'new' | 'mcap'>('new');
  const [q, setQ] = useState('');
  const feed = useAsync(() => api.tokens(sort), [sort]);

  // refresh market caps every 30s
  useEffect(() => {
    const i = window.setInterval(feed.reload, 30_000);
    return () => window.clearInterval(i);
  }, [feed.reload]);

  const tokens = useMemo(() => {
    const t = feed.data?.tokens ?? null;
    if (!t || !q.trim()) return t;
    const s = q.trim().toLowerCase().replace(/^\$/, '');
    return t.filter((x) => x.name.toLowerCase().includes(s) || x.ticker.toLowerCase().includes(s) || x.mint.toLowerCase() === s);
  }, [feed.data, q]);

  return (
    <div className="wrap py-10 sm:py-14">
      <div className="eyebrow flex items-center gap-2">
        <span className="text-glow">//</span> feed
      </div>
      <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tightest sm:text-5xl">Launched here.</h1>
          <p className="mt-3 max-w-lg text-[15px] text-ink-400">Every coin created through AFTER PAD. Market cap from DexScreener, refreshed every 30 seconds.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Icon name="search" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input className="field h-10 w-full py-0 pl-9 text-sm sm:w-56" placeholder="Search name, $ticker, CA" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex h-10 rounded-lg border border-ink-700 bg-ink-900 p-1" role="tablist" aria-label="Sort">
            {(['new', 'mcap'] as const).map((s) => (
              <button
                key={s}
                role="tab"
                aria-selected={sort === s}
                onClick={() => setSort(s)}
                className={`flex-1 rounded-md px-4 text-sm transition sm:flex-none ${sort === s ? 'bg-ink-750 text-ink-100 shadow-[inset_0_0_0_1px_#34302a]' : 'text-ink-400 hover:text-ink-200'}`}
              >
                {s === 'new' ? 'Newest' : 'Market cap'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-3 mt-8 flex h-5 items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">
        <span>{tokens ? `${tokens.length} coin${tokens.length === 1 ? '' : 's'}` : ''}</span>
        {feed.loading && feed.data && <Spinner size={12} />}
        {feed.error && <span className="text-bad">{feed.error}</span>}
      </div>
      {q && tokens && tokens.length === 0 && feed.data?.tokens.length ? (
        <p className="rounded-2xl border border-ink-700 bg-ink-850 p-10 text-center text-sm text-ink-400">No coin matches “{q}”.</p>
      ) : (
        <FeedList tokens={tokens} loading={feed.loading} />
      )}
    </div>
  );
}
