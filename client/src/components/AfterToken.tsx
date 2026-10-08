import { useConfig } from '../lib/config';
import { links } from '../lib/format';
import { CopyField, ExtLink } from './bits';
import { Icon } from './Icon';

export function AfterToken({ compact = false }: { compact?: boolean }) {
  const { afterMint, afterX, afterTelegram } = useConfig();
  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-850">
      <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-96 rounded-full bg-glow/10 blur-3xl" />
      <div className={`relative grid gap-8 p-6 sm:p-8 ${compact ? '' : 'lg:grid-cols-[1fr_1.1fr] lg:items-center'}`}>
        <div>
          <div className="eyebrow">the token</div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="glow-text font-mono text-5xl font-semibold tracking-tight text-glow sm:text-6xl">$AFTER</span>
          </div>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-400">
            The coin behind the pad. Launched the same way as everything else here — and the first one the AI will take over when After Mode ships.
          </p>
        </div>
        <div className="space-y-4">
          {afterMint ? (
            <CopyField label="Contract address" value={afterMint} />
          ) : (
            <div>
              <div className="label">Contract address</div>
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-ink-600 px-3.5 py-3 font-mono text-[13px] text-ink-500">
                <span className="h-1.5 w-1.5 rounded-full bg-glow animate-breathe" /> not announced yet — only trust the CA posted here
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <ExtLink href={afterMint ? links.dex(afterMint) : '#'} disabled={!afterMint}>
              <Icon name="sort" size={14} /> Chart
            </ExtLink>
            <ExtLink href={afterMint ? links.pump(afterMint) : '#'} disabled={!afterMint}>
              pump.fun
            </ExtLink>
            {afterX && (
              <ExtLink href={afterX}>
                <Icon name="xlogo" size={13} /> X
              </ExtLink>
            )}
            {afterTelegram && (
              <ExtLink href={afterTelegram}>
                <Icon name="telegram" size={14} /> Telegram
              </ExtLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
