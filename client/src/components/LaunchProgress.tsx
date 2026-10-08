import { useEffect, useRef } from 'react';
import { STEPS, type LaunchState, type StepId } from '../lib/launch';
import { Icon, Spinner } from './Icon';
import { useLockBody } from '../lib/hooks';

const label = (s: StepId, dryRun: boolean, mode: LaunchState['mode']): [string, string] => {
  switch (s) {
    case 'upload':
      return ['Pin image + metadata', 'IPFS'];
    case 'build':
      return ['Build transaction', 'PumpPortal · create'];
    case 'sign':
      return mode === 'mock' ? ['Sign in wallet', 'dry-run message · no funds move'] : ['Sign in wallet', 'approve in your wallet'];
    case 'send':
      return dryRun ? ['Simulate', 'Helius · simulateTransaction'] : ['Send', 'Helius RPC'];
    case 'confirm':
      return dryRun ? ['Record', 'simulated launch saved'] : ['Confirm on-chain', 'waiting for confirmation'];
  }
};

export function LaunchProgress({ state, dryRun, onRetry, onClose }: { state: LaunchState; dryRun: boolean; onRetry: () => void; onClose: () => void }) {
  useLockBody(true);
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [state.log.length]);

  const cur = state.step ? STEPS.indexOf(state.step) : -1;
  const running = state.status === 'running';
  const title =
    state.status === 'done' ? (dryRun ? 'Simulation passed' : 'Launched') : state.status === 'error' ? 'Launch stopped' : state.step === 'sign' ? 'Check your wallet' : 'Launching…';

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center sm:items-center" role="dialog" aria-modal aria-live="polite" aria-label="Launch progress">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={running ? undefined : onClose} />
      <div className="relative w-full max-w-[460px] animate-rise overflow-hidden rounded-t-2xl border border-ink-700 bg-ink-850 pb-[env(safe-area-inset-bottom)] shadow-glow-lg sm:rounded-2xl">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-80 -translate-x-1/2 rounded-full bg-glow/15 blur-3xl" />
        <div className="relative flex items-start justify-between p-5 pb-3">
          <div>
            <div className="eyebrow">{dryRun ? 'dry run' : 'mainnet'}</div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
          </div>
          <button className="btn-quiet -mr-2 p-2" onClick={onClose} disabled={running} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>

        <ol className="relative space-y-0.5 px-5">
          {STEPS.map((s, i) => {
            const done = state.status === 'done' || i < cur;
            const active = i === cur && running;
            const failed = i === cur && state.status === 'error';
            const [t, sub] = label(s, dryRun, state.mode);
            return (
              <li key={s} className="flex items-center gap-3 py-2">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs ${
                    done ? 'border-glow/50 bg-glow/15 text-glow' : active ? 'border-glow text-glow shadow-glow' : failed ? 'border-bad/60 bg-bad/10 text-bad' : 'border-ink-700 text-ink-500'
                  }`}
                >
                  {done ? <Icon name="check" size={13} /> : active ? <Spinner size={13} /> : failed ? <Icon name="x" size={13} /> : <span className="num">{i + 1}</span>}
                </span>
                <div className="min-w-0">
                  <div className={`text-sm ${done || active ? 'text-ink-100' : failed ? 'text-bad' : 'text-ink-400'}`}>{t}</div>
                  <div className="truncate font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-500">{sub}</div>
                </div>
              </li>
            );
          })}
        </ol>

        {state.error && (
          <div className="mx-5 mt-3 flex gap-2.5 rounded-lg border border-bad/30 bg-bad/10 p-3 text-sm text-bad">
            <Icon name="alert" className="mt-0.5 shrink-0" />
            <span className="min-w-0 break-words">{state.error}</span>
          </div>
        )}

        <div ref={logRef} className="no-scrollbar mx-5 mt-4 max-h-28 overflow-y-auto rounded-lg border border-ink-700 bg-ink-950 p-3 font-mono text-[11px] leading-relaxed text-ink-400">
          {state.log.length ? (
            state.log.map((l, i) => (
              <div key={i} className="break-all">
                <span className="text-ink-600">›</span> {l}
              </div>
            ))
          ) : (
            <span className="text-ink-600">› waiting…</span>
          )}
        </div>

        <div className="flex gap-2 p-5">
          {state.status === 'error' ? (
            <>
              <button className="btn-ghost flex-1" onClick={onClose}>
                Edit
              </button>
              <button className="btn-glow flex-1" onClick={onRetry}>
                <Icon name="refresh" /> Retry
              </button>
            </>
          ) : state.status === 'done' ? (
            <div className="flex w-full items-center justify-center gap-2 py-2 text-sm text-glow">
              <Spinner /> opening your coin…
            </div>
          ) : (
            <p className="w-full text-center text-xs text-ink-500">Don’t close this window. Nothing is sent without your signature.</p>
          )}
        </div>
      </div>
    </div>
  );
}
