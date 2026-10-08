import { SoonBadge } from './bits';

const STEPS = [
  { n: '01', t: 'Launch', d: 'Name it, drop an image, set your dev buy. Sign once in your own wallet. It’s live on pump.fun.', state: 'live' },
  { n: '02', t: 'Leave', d: 'Close the laptop. Push the chair back. Nobody is waiting for you to post.', state: 'live' },
  { n: '03', t: 'The AI takes over', d: 'An agent runs the X account, replies, the site and announcements, with guarded buybacks.', state: 'soon' },
];

export function HowItWorks() {
  return (
    <div className="grid overflow-hidden rounded-2xl border border-ink-700 bg-ink-700 md:grid-cols-3 md:gap-px">
      {STEPS.map((s, i) => (
        <div key={s.n} className={`relative bg-ink-850 p-6 sm:p-7 ${i > 0 ? 'border-t border-ink-700 md:border-t-0' : ''}`}>
          <div className="flex items-center justify-between">
            <span className={`font-mono text-sm ${s.state === 'soon' ? 'text-ink-500' : 'text-glow'}`}>{s.n}</span>
            {s.state === 'soon' ? <SoonBadge /> : <span className="badge">available</span>}
          </div>
          <h3 className={`mt-8 text-2xl font-semibold tracking-tight ${s.state === 'soon' ? 'text-ink-300' : 'text-ink-100'}`}>{s.t}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-400">{s.d}</p>
          {i < 2 && <span className="absolute right-[-7px] top-1/2 z-10 hidden h-3 w-3 -translate-y-1/2 rotate-45 border-r border-t border-ink-700 bg-ink-850 md:block" />}
        </div>
      ))}
    </div>
  );
}
