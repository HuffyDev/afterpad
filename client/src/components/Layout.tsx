import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { WalletButton } from './WalletButton';
import { Icon } from './Icon';
import { useConfig } from '../lib/config';
import { useLockBody } from '../lib/hooks';

const NAV = [
  { to: '/launch', label: 'Launch' },
  { to: '/feed', label: 'Feed' },
  { to: '/after-mode', label: 'After Mode', soon: true },
  { to: '/after', label: '$AFTER' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return (
    <div className="night grain flex min-h-screen flex-col">
      <DryRunBanner />
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function DryRunBanner() {
  const { dryRun } = useConfig();
  if (!dryRun) return null;
  return (
    <div className="border-b border-glow/20 bg-glow/[0.06]">
      <div className="wrap flex items-center justify-center gap-2 py-1.5 text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-glow/90">
        <span className="h-1.5 w-1.5 rounded-full bg-glow animate-breathe" />
        dry run — launches are simulated, nothing is sent on-chain
      </div>
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useLockBody(open);
  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/70 bg-ink-900/80 backdrop-blur-xl">
      <div className="wrap flex h-14 items-center gap-6">
        <Link to="/" aria-label="AFTER PAD home" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm transition ${isActive ? 'text-ink-100' : 'text-ink-400 hover:text-ink-100'}`
              }
            >
              {({ isActive }) => (
                <span className="relative inline-flex items-center gap-1.5">
                  {n.label}
                  {n.soon && <span className="h-1 w-1 rounded-full bg-glow" title="coming soon" />}
                  {isActive && <span className="absolute -bottom-[17px] left-0 right-0 h-px bg-glow shadow-[0_0_8px_#f3a649]" />}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/launch" className="btn-glow hidden px-3.5 py-2 sm:inline-flex">
            Launch a coin
          </Link>
          <WalletButton compact />
          <button className="btn-quiet -mr-2 p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <Icon name={open ? 'x' : 'menu'} size={20} />
          </button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-40 animate-rise bg-ink-900/98 backdrop-blur-xl md:hidden">
          <nav className="wrap flex flex-col py-4">
            {[{ to: '/', label: 'Home' }, ...NAV].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end
                className={({ isActive }) =>
                  `flex items-center justify-between border-b border-ink-700/70 py-4 text-2xl font-semibold tracking-tight ${isActive ? 'text-glow' : 'text-ink-100'}`
                }
              >
                <span className="flex items-center gap-3">
                  {n.label}
                  {'soon' in n && n.soon && <span className="badge-soon">soon</span>}
                </span>
                <Icon name="chevron" className="text-ink-500" />
              </NavLink>
            ))}
            <Link to="/launch" className="btn-glow mt-6 py-3.5 text-base">
              Launch a coin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const { afterX, afterTelegram } = useConfig();
  return (
    <footer className="mt-24 border-t border-ink-700/70 bg-ink-950/60">
      <div className="wrap grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-400">Launch it. Then leave. A non-custodial launch tool for pump.fun coins.</p>
          <div className="mt-5 flex gap-2">
            {afterX && (
              <a href={afterX} target="_blank" rel="noreferrer" className="btn-ghost p-2.5" aria-label="AFTER PAD on X">
                <Icon name="xlogo" />
              </a>
            )}
            {afterTelegram && (
              <a href={afterTelegram} target="_blank" rel="noreferrer" className="btn-ghost p-2.5" aria-label="AFTER PAD on Telegram">
                <Icon name="telegram" />
              </a>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm md:col-span-1">
          <div className="space-y-2.5">
            <div className="eyebrow mb-3">product</div>
            <Link className="block text-ink-300 hover:text-ink-100" to="/launch">Launch</Link>
            <Link className="block text-ink-300 hover:text-ink-100" to="/feed">Feed</Link>
            <Link className="block text-ink-300 hover:text-ink-100" to="/after-mode">After Mode</Link>
          </div>
          <div className="space-y-2.5">
            <div className="eyebrow mb-3">token</div>
            <Link className="block text-ink-300 hover:text-ink-100" to="/after">$AFTER</Link>
            <Link className="block text-ink-300 hover:text-ink-100" to="/after-mode#waitlist">Waitlist</Link>
          </div>
        </div>
        <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
          <div className="eyebrow mb-2 flex items-center gap-2">
            <Icon name="alert" size={12} /> disclaimer
          </div>
          <p className="text-xs leading-relaxed text-ink-400">
            AFTER PAD is a non-custodial tool. It never holds your keys or funds; every transaction is built for and signed by your own wallet. You launch at your own risk.
            Nothing here is financial advice. Memecoins are extremely volatile and most go to zero. AFTER PAD is not affiliated with, endorsed by, or operated by pump.fun.
          </p>
        </div>
      </div>
      <div className="border-t border-ink-700/60">
        <div className="wrap flex flex-col gap-2 py-5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} after pad</span>
          <span>the dev leaves. the AI stays.</span>
        </div>
      </div>
    </footer>
  );
}
