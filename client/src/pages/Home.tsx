import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DeskScene } from '../components/DeskScene';
import { HowItWorks } from '../components/HowItWorks';
import { FeedList } from '../components/FeedList';
import { AfterToken } from '../components/AfterToken';
import { SectionHead, SoonBadge } from '../components/bits';
import { Icon } from '../components/Icon';
import { api } from '../lib/api';
import { useAsync, useCopy } from '../lib/hooks';
import { useConfig } from '../lib/config';
import { clockString, links } from '../lib/format';

export default function Home() {
  const feed = useAsync(() => api.tokens('new'), []);
  const wl = useAsync(() => api.waitlistCount(), []);
  const [clock, setClock] = useState(clockString());
  useEffect(() => {
    const i = window.setInterval(() => setClock(clockString()), 10_000);
    return () => window.clearInterval(i);
  }, []);
  const count = feed.data?.tokens.length ?? null;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <HeroBanner />
        <div className="wrap relative grid grid-cols-1 items-center gap-8 pb-14 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pb-24 lg:pt-20">
          <div className="relative z-10 min-w-0 animate-rise">
            <div className="eyebrow flex items-center gap-3">
              <span className="num text-glow">{clock}</span>
              <span className="h-px w-8 bg-ink-600" />
              <span>dev status: offline</span>
            </div>
            <h1 className="mt-6 text-[clamp(3rem,9vw,6.4rem)] font-bold leading-[0.9] tracking-tightest text-ink-100">
              LAUNCH IT.
              <br />
              <span className="glow-text text-glow">THEN LEAVE.</span>
            </h1>
            <p className="mt-6 font-mono text-base text-ink-300 sm:text-lg">
              the dev leaves. <span className="text-ink-100">the AI stays.</span>
            </p>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-400">
              A non-custodial launchpad for pump.fun. Make a coin from your own wallet in under a minute — no platform fee, no keys handed over.
            </p>
            <CaStrip />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/launch" className="btn-glow px-6 py-3.5 text-[15px]">
                <Icon name="bolt" /> Launch a coin
              </Link>
              <Link to="/after-mode" className="btn-ghost px-5 py-3.5 text-[15px]">
                What happens after <SoonBadge>soon</SoonBadge>
              </Link>
            </div>
          </div>
          <div className="relative -mx-4 sm:mx-0">
            <div className="pointer-events-none absolute inset-x-10 top-10 -z-0 h-2/3 rounded-full bg-glow/10 blur-[90px]" />
            <DeskScene className="relative h-auto w-full [mask-image:radial-gradient(75%_75%_at_50%_45%,#000_60%,transparent)]" />
          </div>
        </div>

        {/* stat strip */}
        <div className="border-y border-ink-700/70 bg-ink-950/40">
          <div className="wrap grid grid-cols-2 divide-ink-700/70 md:grid-cols-4 md:divide-x">
            <Stat k="coins launched" v={count == null ? '—' : String(count)} />
            <Stat k="platform fee" v="0%" />
            <Stat k="keys we hold" v="0" />
            <Stat k="after mode waitlist" v={wl.data ? String(wl.data.count) : '—'} accent />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="wrap pt-20 sm:pt-28">
        <SectionHead index="//" eyebrow="how it works" title="Three steps. You only do two." />
        <HowItWorks />
      </section>

      {/* FEED PREVIEW */}
      <section className="wrap pt-20 sm:pt-28">
        <SectionHead
          index="//"
          eyebrow="launched on after pad"
          title="Recently left behind."
          action={
            <Link to="/feed" className="btn-ghost self-start sm:self-auto">
              Full feed <Icon name="arrow" size={14} />
            </Link>
          }
        />
        <FeedList tokens={feed.data?.tokens.slice(0, 6) ?? null} loading={feed.loading} />
      </section>

      {/* AFTER MODE TEASER */}
      <section className="wrap pt-20 sm:pt-28">
        <div className="relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-850">
          <div className="scan pointer-events-none absolute inset-0 opacity-60" />
          <div className="pointer-events-none absolute -right-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-glow/15 blur-[100px]" />
          <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="eyebrow">after mode</span>
                <SoonBadge>in development</SoonBadge>
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tightest sm:text-5xl">
                When you log off,
                <br />
                <span className="text-ink-400">something else logs on.</span>
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-400">
                We’re building an agent that takes over a coin after the dev leaves: posting, replying, keeping the site current, and running buybacks inside hard limits.
                It isn’t live. Join the waitlist to be first.
              </p>
              <Link to="/after-mode" className="btn-glow mt-7">
                Read the plan & join the waitlist <Icon name="arrow" />
              </Link>
            </div>
            <TerminalMock />
          </div>
        </div>
      </section>

      {/* $AFTER */}
      <section className="wrap pt-20 sm:pt-28">
        <AfterToken />
      </section>
    </>
  );
}

/** client/public/banner.jpg behind the hero; hidden if the file isn't there. */
function HeroBanner() {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <img src="/banner.jpg" alt="" onError={() => setOk(false)} className="h-full w-full object-cover opacity-45 [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/75 to-ink-900/30" />
    </div>
  );
}

function CaStrip() {
  const { afterMint } = useConfig();
  const { copied, copy } = useCopy();
  if (!afterMint) return null;
  return (
    <div className="mt-7 flex max-w-md items-stretch overflow-hidden rounded-lg border border-ink-700 bg-ink-900/80 backdrop-blur">
      <button onClick={() => copy(afterMint)} className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left hover:bg-ink-800" aria-label="Copy $AFTER contract address">
        <span className="shrink-0 font-mono text-[11px] font-semibold text-glow">$AFTER</span>
        <span className="num min-w-0 truncate text-[12px] text-ink-300">{afterMint}</span>
        <Icon name={copied ? 'check' : 'copy'} size={13} className={`shrink-0 ${copied ? 'text-glow' : 'text-ink-500'}`} />
      </button>
      <a href={links.pump(afterMint)} target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-1.5 border-l border-ink-700 px-3 font-mono text-[11px] uppercase tracking-widest text-ink-300 hover:bg-ink-800 hover:text-glow">
        pump.fun <Icon name="out" size={12} />
      </a>
    </div>
  );
}

function Stat({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="px-1 py-5 md:px-6">
      <div className={`num text-2xl sm:text-3xl ${accent ? 'text-glow' : 'text-ink-100'}`}>{v}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">{k}</div>
    </div>
  );
}

function TerminalMock() {
  const rows = [
    ['03:12', 'dev', 'gm. launching tonight.', 'text-ink-300'],
    ['03:14', 'dev', 'ok it’s live. going to bed.', 'text-ink-300'],
    ['03:14', 'sys', 'dev session closed', 'text-bad/80'],
    ['03:15', 'after', 'handover requested · awaiting enrollment', 'text-glow'],
    ['—', 'after', 'status: coming soon', 'text-ink-500'],
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-950/90 shadow-[0_30px_80px_-30px_#000]">
      <div className="flex items-center gap-1.5 border-b border-ink-700 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-ink-600" />
        <span className="h-2 w-2 rounded-full bg-ink-600" />
        <span className="h-2 w-2 rounded-full bg-ink-600" />
        <span className="ml-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">after.log · preview</span>
      </div>
      <div className="space-y-2 p-4 font-mono text-[12px] leading-relaxed">
        {rows.map(([t, who, msg, c], i) => (
          <div key={i} className="grid grid-cols-[42px_44px_1fr] gap-2">
            <span className="text-ink-600">{t}</span>
            <span className={who === 'after' ? 'text-glow' : 'text-ink-500'}>{who}</span>
            <span className={c}>{msg}</span>
          </div>
        ))}
        <div className="grid grid-cols-[42px_44px_1fr] gap-2">
          <span />
          <span className="text-glow">after</span>
          <span className="inline-block h-3.5 w-2 animate-blink bg-glow" />
        </div>
      </div>
    </div>
  );
}
