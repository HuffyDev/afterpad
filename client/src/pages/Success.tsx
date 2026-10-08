import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TokenCard } from '../components/TokenCard';
import { CopyField, ExtLink, Skeleton, SoonBadge } from '../components/bits';
import { Icon, Spinner } from '../components/Icon';
import { api } from '../lib/api';
import { links } from '../lib/format';
import { useAsync } from '../lib/hooks';
import { lastLocalImage } from '../lib/launch';
import { downloadBlob, renderCard } from '../lib/cardImage';
import { useConfig } from '../lib/config';

export default function Success() {
  const { id = '' } = useParams();
  const { siteUrl } = useConfig();
  const { data, error } = useAsync(() => api.launch(id), [id]);
  const [dl, setDl] = useState<'idle' | 'busy' | 'err'>('idle');
  const l = data?.launch;

  if (error)
    return (
      <div className="wrap py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Launch not found.</h1>
        <Link to="/launch" className="btn-ghost mt-6">
          Back to launch
        </Link>
      </div>
    );
  if (!l)
    return (
      <div className="wrap grid gap-10 py-16 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      </div>
    );

  const sim = l.simulated || l.status === 'simulated';
  const live = l.status === 'confirmed' || l.status === 'sent';
  const image = lastLocalImage.get(l.launchId) ?? l.imageUri;
  const site = siteUrl || location.origin;
  const tweet = `just launched $${l.ticker} on @afterpad.\n\nthe dev leaves. the AI stays.\n\n${links.pump(l.mint)}\n${site}/token/${l.mint}`;

  const download = async () => {
    setDl('busy');
    try {
      const blob = await renderCard({ name: l.name, ticker: l.ticker, mint: l.mint, image, simulated: sim });
      downloadBlob(blob, `${l.ticker.toLowerCase()}-afterpad.png`);
      setDl('idle');
    } catch {
      setDl('err');
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-glow/10 blur-[120px]" />
      <div className="wrap relative grid grid-cols-1 items-start gap-12 py-12 sm:py-16 lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-16">
        <div className="order-2 lg:order-1">
          <TokenCard
            d={{
              name: l.name,
              ticker: l.ticker,
              description: l.description,
              image,
              banner: l.bannerUri,
              website: l.website,
              twitter: l.twitter,
              telegram: l.telegram,
              creator: l.creator,
              mint: l.mint,
              devBuySol: l.devBuySol,
              simulated: sim,
            }}
          />
          <button className="btn-ghost mt-3 w-full" onClick={download} disabled={dl === 'busy'}>
            {dl === 'busy' ? <Spinner /> : <Icon name="download" />} Download card image
          </button>
          {dl === 'err' && <p className="mt-2 text-center text-xs text-bad">Couldn’t render the card. Try again.</p>}
        </div>

        <div className="order-1 animate-rise lg:order-2">
          <div className="eyebrow flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${sim ? 'bg-glow' : 'bg-ok'}`} />
            {sim ? 'dry run complete' : l.status === 'sent' ? 'sent · confirming' : 'confirmed on solana'}
          </div>
          <h1 className="mt-4 text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[0.95] tracking-tightest">
            {sim ? (
              <>
                Simulation passed.
                <br />
                <span className="text-ink-400">Nothing was sent.</span>
              </>
            ) : (
              <>
                It’s live.
                <br />
                <span className="glow-text text-glow">Now leave.</span>
              </>
            )}
          </h1>
          {sim && (
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-400">
              AFTER PAD is running in dry-run mode. The flow ran end to end, but no transaction was broadcast. This mint address doesn’t exist on-chain.
            </p>
          )}

          <CopyField className="mt-8" label="Contract address" value={l.mint} />

          <div className="mt-5 flex flex-wrap gap-2">
            <ExtLink href={links.pump(l.mint)} disabled={!live}>pump.fun</ExtLink>
            <ExtLink href={links.solscan(l.mint)} disabled={!live}>Solscan</ExtLink>
            <ExtLink href={links.dex(l.mint)} disabled={!live}>DexScreener</ExtLink>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a href={links.tweet(tweet)} target="_blank" rel="noreferrer" className="btn-glow py-3.5">
              <Icon name="xlogo" /> Share on X
            </a>
            <Link to={`/token/${l.mint}`} className="btn-ghost py-3.5">
              Open token page <Icon name="arrow" size={14} />
            </Link>
          </div>

          <div className="mt-10 rounded-xl border border-ink-700 bg-ink-850 p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs font-semibold tracking-[0.14em]">NEXT: HAND IT TO THE AI</span>
              <SoonBadge />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">After Mode isn’t live yet. Join the waitlist and we’ll let you know when coins can be handed over.</p>
            <Link to="/after-mode#waitlist" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-glow hover:text-glow-hot">
              Join the waitlist <Icon name="arrow" size={14} />
            </Link>
          </div>

          <Link to="/launch" className="btn-quiet mt-6 px-0">
            <Icon name="refresh" size={14} /> Launch another
          </Link>
        </div>
      </div>
    </div>
  );
}
