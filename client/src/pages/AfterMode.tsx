import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SectionHead, SoonBadge } from '../components/bits';
import { Icon, type IconName } from '../components/Icon';
import { WaitlistForm } from '../components/WaitlistForm';

const CAPS: { icon: IconName; t: string; d: string }[] = [
  { icon: 'xlogo', t: 'Runs the X account', d: 'Posts on a cadence that fits the coin’s voice. No dead timelines after the dev logs off.' },
  { icon: 'chat', t: 'Replies', d: 'Answers holders and quote-tweets in-thread, with filters for spam, scams and impersonators.' },
  { icon: 'layout', t: 'Keeps the site alive', d: 'A simple coin site that updates itself — stats, links, the latest posts.' },
  { icon: 'megaphone', t: 'Announcements', d: 'Milestones, listings, migrations. Written, scheduled and posted without a human.' },
  { icon: 'cycle', t: 'Guarded buybacks', d: 'Optional buybacks from a dedicated treasury, inside hard on-chain limits you set before handing over.' },
];

const GUARDS = [
  'The agent never touches the creator’s wallet. A separate, capped treasury only.',
  'Spend limits per day and per trade, set by you, enforced in code, not by a prompt.',
  'Kill switch: the creator can pause or revoke the agent at any time.',
  'Every action is logged publicly so holders can audit what it did.',
];

export default function AfterMode() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [hash]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink-700/60">
        <div className="pointer-events-none absolute right-0 top-0 h-[420px] w-[620px] rounded-full bg-glow/10 blur-[120px]" />
        <div className="wrap relative py-14 sm:py-20">
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow">
              <span className="text-glow">//</span> after mode
            </span>
            <SoonBadge>in development · not live</SoonBadge>
          </div>
          <h1 className="mt-5 max-w-4xl text-[clamp(2.6rem,7vw,5.2rem)] font-bold leading-[0.92] tracking-tightest">
            The dev leaves.
            <br />
            <span className="glow-text text-glow">The AI stays.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-ink-400">
            After Mode is the part of AFTER PAD we’re still building: an agent that takes over a coin once its creator walks away. This page describes the plan. None of it is
            running today, and no coin launched here is managed by an AI yet.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#waitlist" className="btn-glow px-6 py-3.5">
              Join the waitlist <Icon name="arrow" />
            </a>
          </div>
        </div>
      </section>

      <section className="wrap pt-20">
        <SectionHead index="01" eyebrow="what it will do" title="Planned capabilities.">
          Scope can change while we build. Each item is marked planned until it ships.
        </SectionHead>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-ink-700 bg-ink-700 sm:grid-cols-2 lg:grid-cols-3">
          {CAPS.map((c) => (
            <div key={c.t} className="bg-ink-850 p-6">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-ink-700 bg-ink-900 text-glow">
                  <Icon name={c.icon} />
                </span>
                <span className="badge">planned</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold tracking-tight">{c.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{c.d}</p>
            </div>
          ))}
          <div className="flex flex-col justify-between bg-ink-900 p-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">status</span>
            <div>
              <div className="font-mono text-3xl text-glow">building</div>
              <p className="mt-1 text-sm text-ink-400">No release date yet. Waitlist first.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap pt-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionHead index="02" eyebrow="guardrails" title="An agent with hard limits." />
            <ul className="space-y-3">
              {GUARDS.map((g) => (
                <li key={g} className="flex gap-3 rounded-xl border border-ink-700 bg-ink-850 p-4 text-sm leading-relaxed text-ink-300">
                  <Icon name="shield" className="mt-0.5 shrink-0 text-glow" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHead index="03" eyebrow="how handover will work" title="One switch at launch." />
            <ol className="relative space-y-6 border-l border-ink-700 pl-6">
              {[
                ['Launch with After Mode on', 'The toggle on the launch form, disabled today, enrolls the coin.'],
                ['Set the limits', 'Treasury size, buyback caps, posting voice, what it may never say.'],
                ['Log off', 'The agent takes the keys to the socials, not to your wallet.'],
              ].map(([t, d], i) => (
                <li key={t} className="relative">
                  <span className="absolute -left-[31px] top-0.5 grid h-3.5 w-3.5 place-items-center rounded-full border border-glow/60 bg-ink-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-glow" />
                  </span>
                  <div className="font-mono text-[11px] text-ink-500">step {i + 1}</div>
                  <div className="mt-0.5 font-medium text-ink-100">{t}</div>
                  <p className="mt-1 text-sm text-ink-400">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="waitlist" className="wrap scroll-mt-24 pt-20">
        <div className="relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-850">
          <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-96 rounded-full bg-glow/10 blur-[100px]" />
          <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="eyebrow">
                <span className="text-glow">04</span> &nbsp;waitlist
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tightest sm:text-4xl">Get the first handover.</h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-400">
                Leave your X handle and wallet. When After Mode opens, early spots go to the waitlist. We’ll only ever contact you from our official X account.
              </p>
            </div>
            <WaitlistForm />
          </div>
        </div>
      </section>
    </>
  );
}
