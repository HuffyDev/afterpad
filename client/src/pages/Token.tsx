import { Link, useParams } from 'react-router-dom';
import { CopyField, ExtLink, Skeleton, SoonBadge, TokenAvatar } from '../components/bits';
import { Icon } from '../components/Icon';
import { api } from '../lib/api';
import { ago, links, short, usd } from '../lib/format';
import { useAsync } from '../lib/hooks';

export default function TokenPage() {
  const { mint = '' } = useParams();
  const { data, error, loading } = useAsync(() => api.token(mint), [mint]);
  const t = data?.token;

  if (loading && !t)
    return (
      <div className="wrap py-12">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="mt-6 flex gap-4">
          <Skeleton className="h-20 w-20 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-60" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  if (error || !t)
    return (
      <div className="wrap py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">› 404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">No coin at this address.</h1>
        <p className="mt-2 text-ink-400">It wasn’t launched through AFTER PAD, or the address is wrong.</p>
        <Link to="/feed" className="btn-ghost mt-6">
          Back to feed
        </Link>
      </div>
    );

  const live = t.status === 'confirmed';
  return (
    <div className="pb-8">
      <div className="relative h-40 overflow-hidden border-b border-ink-700 sm:h-56">
        {t.bannerUri ? (
          <img src={t.bannerUri} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="scan h-full w-full bg-ink-850">
            <div className="absolute left-1/2 top-0 h-56 w-[600px] -translate-x-1/2 rounded-full bg-glow/15 blur-[90px]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/20 to-transparent" />
      </div>

      <div className="wrap">
        <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <TokenAvatar src={t.imageUri} ticker={t.ticker} size={104} className="rounded-2xl border-ink-600 shadow-[0_20px_50px_-20px_#000]" />
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tightest sm:text-4xl">{t.name}</h1>
                {t.simulated && <span className="badge border-glow/40 text-glow">dry run</span>}
                {t.status === 'sent' && <span className="badge">confirming</span>}
              </div>
              <div className="num mt-1 text-glow">${t.ticker}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ExtLink href={links.pump(t.mint)} disabled={!live}>pump.fun</ExtLink>
            <ExtLink href={links.dex(t.mint)} disabled={!live}>DexScreener</ExtLink>
            <ExtLink href={links.solscan(t.mint)} disabled={!live}>Solscan</ExtLink>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ink-700 bg-ink-700 sm:grid-cols-4">
              <Metric k="market cap" v={usd(t.marketCapUsd)} />
              <Metric k="price" v={t.priceUsd == null ? '—' : `$${t.priceUsd.toPrecision(3)}`} />
              <Metric
                k="24h"
                v={t.priceChange24h == null ? '—' : `${t.priceChange24h >= 0 ? '+' : ''}${t.priceChange24h.toFixed(1)}%`}
                tone={t.priceChange24h == null ? undefined : t.priceChange24h >= 0 ? 'ok' : 'bad'}
              />
              <Metric k="dev buy" v={`${t.devBuySol} SOL`} />
            </div>

            {live ? (
              <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-850">
                <iframe title={`${t.ticker} chart`} src={links.dexEmbed(t.mint)} className="h-[420px] w-full sm:h-[480px]" loading="lazy" />
              </div>
            ) : (
              <div className="grid h-64 place-items-center rounded-xl border border-dashed border-ink-700 bg-ink-850/60 text-center">
                <div>
                  <Icon name="sort" size={20} className="mx-auto text-ink-500" />
                  <p className="mt-3 text-sm text-ink-400">{t.simulated ? 'Simulated launch — no chart. Nothing exists on-chain.' : 'Chart appears once the launch confirms.'}</p>
                </div>
              </div>
            )}

            {t.description && (
              <div>
                <div className="eyebrow mb-3">description</div>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-300">{t.description}</p>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <CopyField label="Contract address" value={t.mint} />
            <div className="panel divide-y divide-ink-700/60 text-sm">
              <Row k="Creator">
                <a className="num text-ink-200 hover:text-glow" href={`https://solscan.io/account/${t.creator}`} target="_blank" rel="noreferrer">
                  {short(t.creator, 6)}
                </a>
              </Row>
              <Row k="Launched">
                <span className="num text-ink-200" title={new Date(t.createdAt).toLocaleString()}>
                  {ago(t.createdAt)}
                </span>
              </Row>
              {t.signature && (
                <Row k="Tx">
                  <a className="num text-ink-200 hover:text-glow" href={links.solscanTx(t.signature)} target="_blank" rel="noreferrer">
                    {short(t.signature, 6)}
                  </a>
                </Row>
              )}
              <Row k="Dev">
                <span className="flex items-center gap-2 text-ink-200">
                  human <span className="text-ink-600">→</span> ai <SoonBadge>soon</SoonBadge>
                </span>
              </Row>
            </div>
            {(t.website || t.twitter || t.telegram) && (
              <div className="flex flex-wrap gap-2">
                {t.website && <ExtLink href={t.website}><Icon name="globe" size={14} /> Website</ExtLink>}
                {t.twitter && <ExtLink href={t.twitter}><Icon name="xlogo" size={13} /> X</ExtLink>}
                {t.telegram && <ExtLink href={t.telegram}><Icon name="telegram" size={14} /> Telegram</ExtLink>}
              </div>
            )}
            <Link to="/after-mode" className="block rounded-xl border border-ink-700 bg-ink-850 p-4 transition hover:border-glow/40">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold tracking-[0.14em]">AFTER MODE</span>
                <SoonBadge />
              </div>
              <p className="mt-2 text-sm text-ink-400">An AI to run this coin after its dev leaves. Not live yet.</p>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Metric({ k, v, tone }: { k: string; v: string; tone?: 'ok' | 'bad' }) {
  return (
    <div className="bg-ink-850 px-4 py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">{k}</div>
      <div className={`num mt-1 text-xl ${tone === 'ok' ? 'text-ok' : tone === 'bad' ? 'text-bad' : 'text-ink-100'}`}>{v}</div>
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-ink-500">{k}</span>
      {children}
    </div>
  );
}
