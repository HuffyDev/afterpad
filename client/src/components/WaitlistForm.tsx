import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { waitlistSchema } from '../../../shared/launch';
import { api } from '../lib/api';
import { Icon, Spinner } from './Icon';

export function WaitlistForm() {
  const { publicKey } = useWallet();
  const [x, setX] = useState('');
  const [wallet, setWallet] = useState('');
  const [state, setState] = useState<{ s: 'idle' | 'busy' | 'ok' | 'err'; msg?: string; count?: number }>({ s: 'idle' });

  useEffect(() => {
    if (publicKey && !wallet) setWallet(publicKey.toBase58());
  }, [publicKey, wallet]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.s === 'busy') return;
    const parsed = waitlistSchema.safeParse({ xHandle: x, wallet });
    if (!parsed.success) return setState({ s: 'err', msg: parsed.error.issues[0]?.message });
    setState({ s: 'busy' });
    try {
      const r = await api.waitlist(parsed.data.xHandle, parsed.data.wallet);
      setState({ s: 'ok', count: r.count, msg: r.status === 'exists' ? 'You’re already on the list.' : 'You’re on the list.' });
    } catch (err) {
      setState({ s: 'err', msg: (err as Error).message });
    }
  };

  if (state.s === 'ok')
    return (
      <div className="rounded-xl border border-glow/40 bg-glow/[0.06] p-5">
        <div className="flex items-center gap-2 text-glow">
          <Icon name="check" /> <span className="font-medium">{state.msg}</span>
        </div>
        <p className="mt-2 text-sm text-ink-400">
          We’ll reach out on X when After Mode opens. {state.count ? <span className="num text-ink-300">#{state.count} in line.</span> : null}
        </p>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <label className="block">
        <span className="label">X handle</span>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-ink-500">@</span>
          <input className="field-mono pl-8" value={x} onChange={(e) => setX(e.target.value)} placeholder="yourhandle" autoComplete="off" spellCheck={false} />
        </div>
      </label>
      <label className="block">
        <span className="label">
          <span>Solana wallet</span>
          {publicKey && <span className="normal-case tracking-normal text-ink-500">from connected wallet</span>}
        </span>
        <input className="field-mono text-[13px]" value={wallet} onChange={(e) => setWallet(e.target.value.trim())} placeholder="Your public address" autoComplete="off" spellCheck={false} />
      </label>
      {state.s === 'err' && <p className="text-sm text-bad">{state.msg}</p>}
      <button className="btn-glow w-full py-3" disabled={state.s === 'busy'}>
        {state.s === 'busy' ? <Spinner /> : <Icon name="arrow" />} Join the waitlist
      </button>
      <p className="text-xs text-ink-500">Public address only. We will never ask for a seed phrase or private key.</p>
    </form>
  );
}
